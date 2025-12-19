from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentRecordViewSet, InventoryViewSet

router = DefaultRouter()
router.register(r'document-records', DocumentRecordViewSet, basename='document-record')
router.register(r'inventories', InventoryViewSet, basename='inventory')

urlpatterns = [
    path('', include(router.urls)),
]
