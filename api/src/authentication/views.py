from django.shortcuts import render
# Users Models
from django.contrib.auth.models import User
# Create your views here.
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from src.authentication.serializers import RegisterSerializer
from rest_framework.permissions import IsAuthenticated

# ✅ สมัครสมาชิก
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

# ✅ ดูข้อมูลโปรไฟล์ (ต้องมี JWT)
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = User.objects.get(id=request.user.id)
        print(user)
        return Response({
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "staff": user.is_staff,
            "email": user.email
        })
