from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentRegistryViewSet, InventoryRecordViewSet, export_inventory_excel

router = DefaultRouter()
router.register(r'document-registries', DocumentRegistryViewSet, basename='documentregistry')
router.register(r'inventory-records', InventoryRecordViewSet, basename='inventoryrecord')

app_name = 'document_registry'

urlpatterns = [
	path('', include(router.urls), name='document_registry'),
	path('export-inventory/<int:document_registry_id>/', export_inventory_excel, name='export_inventory_excel'),
]
