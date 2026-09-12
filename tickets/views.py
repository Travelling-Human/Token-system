from datetime import timedelta
from django.utils import timezone
from django.db.models import Avg, Count, F, ExpressionWrapper, DurationField
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Category, Ticket, Device
from .serializers import CategorySerializer, TicketSerializer, TicketCommentSerializer, DeviceSerializer
from .permissions import IsOwnerOrAdmin, IsAdminOrManager


def broadcast_ticket_event(event, ticket_id):
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    async_to_sync(channel_layer.group_send)(
        "tickets",
        {"type": "ticket.update", "data": {"event": event, "ticket_id": ticket_id}}
    )


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class DeviceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer
    permission_classes = [permissions.IsAuthenticated]


class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.profile.role in ('admin', 'manager'):
            queryset = Ticket.objects.all()
        else:
            queryset = Ticket.objects.filter(created_by=user)

        if self.action == 'list':
            cutoff = timezone.now() - timedelta(days=1)
            queryset = queryset.exclude(status='closed', closed_at__lt=cutoff)

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        category = serializer.validated_data.get('category')
        due_by = timezone.now() + timedelta(hours=category.default_sla_hours) if category else None
        ticket = serializer.save(created_by=self.request.user, due_by=due_by)
        broadcast_ticket_event("ticket_created", ticket.id)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated, IsAdminOrManager])
    def assign(self, request, pk=None):
        ticket = self.get_object()
        ticket.assigned_to_id = request.data.get('assigned_to')
        ticket.save()
        broadcast_ticket_event("ticket_assigned", ticket.id)
        return Response(TicketSerializer(ticket).data)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated, IsAdminOrManager])
    def update_status(self, request, pk=None):
        ticket = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Ticket.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        ticket.status = new_status
        if new_status in ('resolved', 'closed') and not ticket.resolved_at:
            ticket.resolved_at = timezone.now()
            ticket.resolved_by = request.user
        if new_status == 'closed':
            ticket.closed_at = timezone.now()
        ticket.save()
        broadcast_ticket_event("status_changed", ticket.id)
        return Response(TicketSerializer(ticket).data)

    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        ticket = self.get_object()
        if request.method == 'POST':
            serializer = TicketCommentSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(ticket=ticket, author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(TicketCommentSerializer(ticket.comments.order_by('created_at'), many=True).data)

    @action(detail=False, methods=['get'])
    def completed(self, request):
        user = request.user
        if user.profile.role in ('admin', 'manager'):
            queryset = Ticket.objects.filter(status='closed')
        else:
            queryset = Ticket.objects.filter(created_by=user, status='closed')
        queryset = queryset.order_by('-closed_at')
        return Response(TicketSerializer(queryset, many=True).data)


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Ticket.objects.all() if request.user.profile.role in ('admin', 'manager') else Ticket.objects.filter(created_by=request.user)
        overdue = qs.filter(due_by__lt=timezone.now(), status__in=['open', 'in_progress']).count()
        resolved = qs.filter(resolved_at__isnull=False)
        avg_resolution = resolved.aggregate(
            avg=Avg(ExpressionWrapper(F('resolved_at') - F('created_at'), output_field=DurationField()))
        )['avg']

        return Response({
            'status_counts': list(qs.values('status').annotate(count=Count('id'))),
            'overdue_count': overdue,
            'avg_resolution_hours': round(avg_resolution.total_seconds() / 3600, 1) if avg_resolution else None,
        })