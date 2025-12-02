from django.urls import path, include
from rest_framework.routers import DefaultRouter
from src.document_control import views

router = DefaultRouter()
router.register(r"items", views.ItemViewSet, basename="item")
router.register(r"alternatives", views.AlternativeItemViewSet, basename="alternative")
router.register(r"equipments", views.RelatedEquipmentViewSet, basename="equipment")
router.register(r"pending", views.PendingTransactionViewSet, basename="pending")
router.register(r"transactions", views.StockTransactionViewSet, basename="transaction")
router.register(r"descriptions", views.DescriptionViewSet, basename="description")

urlpatterns = [
    path("", include(router.urls)),
]
