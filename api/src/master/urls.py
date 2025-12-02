from django.urls import path, include
from rest_framework.routers import DefaultRouter
from src.master.views import MasterViewSet, DescriptionViewSet

router = DefaultRouter()
router.register(r"master", MasterViewSet, basename="master")
router.register(r"descriptions", DescriptionViewSet, basename="description")
app_name = "inventory"

urlpatterns = [
    path("", include(router.urls), name="master"),
]
