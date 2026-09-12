from django.shortcuts import render
from rest_framework import generics, permissions
from .serializers import RegisterSerializer, ProfileSerializer, StaffUserSerializer
from django.contrib.auth.models import User

# Create your views here.

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class MeView(generics.RetrieveAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile

class StaffListView(generics.ListAPIView):
    serializer_class = StaffUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.filter(profile__role='staff')