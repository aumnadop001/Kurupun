from django.urls import path
from kurupun.views import login

urlpatterns = [
    path("login/", login.loginPage, name="login"),  # <--- ตั้งชื่อเป็น 'login'
    path("auth/", login.loginUser, name="loginUser"),
]
