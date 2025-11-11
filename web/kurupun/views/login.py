from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages


def loginPage(request):
    return render(request, "pages/login.html")


def loginUser(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect("document_register")  # ใช้ URL name 'document_register'
        else:
            messages.error(request, "Invalid username or password.")
            return redirect("login")  # ใช้ URL name 'login'
