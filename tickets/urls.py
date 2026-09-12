from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet, CategoryViewSet, DeviceViewSet, DashboardStatsView

router = DefaultRouter()
router.register('tickets', TicketViewSet, basename='ticket')
router.register('categories', CategoryViewSet, basename='category')
router.register('devices', DeviceViewSet, basename='device')


urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', DashboardStatsView.as_view()),
]