from django.urls import path, include
from rest_framework.routers import DefaultRouter
from src.inventory.views import InventoryViewSet  # , export_inventory_excel

router = DefaultRouter()
router.register(r'inventory', InventoryViewSet, basename='inventory')
app_name = 'inventory'

urlpatterns = [
	path('', include(router.urls), name='inventory'),
	# path('export-inventory/<int:document_registry_id>/', export_inventory_excel, name='export_inventory_excel'),
]
