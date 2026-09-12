from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Category, Ticket, TicketComment, Device
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'default_sla_hours']

class TicketCommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = TicketComment
        fields = ['id', 'ticket', 'author', 'author_username', 'message', 'created_at']
        read_only_fields = ['author', 'ticket']
        

class TicketSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True, default=None)
    resolved_by_username = serializers.CharField(source='resolved_by.username', read_only=True, default=None)
    comments = TicketCommentSerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'description', 'category', 'priority', 'status',
            'created_by', 'created_by_username', 'assigned_to', 'assigned_to_username',
            'resolved_by', 'resolved_by_username',
            'created_at', 'updated_at', 'due_by', 'resolved_at', 'closed_at', 'comments'
        ]
        read_only_fields = ['created_by', 'assigned_to', 'resolved_by', 'created_at', 'updated_at', 'resolved_at', 'closed_at']

class DeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Device
        fields = ['id', 'name', 'device_type', 'location', 'status']

