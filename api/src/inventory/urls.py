from django.urls import path, include
from rest_framework.routers import DefaultRouter
from src.inventory.views import InventoryViewSet, export_inventory_excel

router = DefaultRouter()
router.register(r'', InventoryViewSet, basename='inventory')
app_name = 'inventory'

urlpatterns = [
	path('inventory/', include(router.urls)),
	path('master/export-inventories/', export_inventory_excel, name='export_inventory_excel'),
]
