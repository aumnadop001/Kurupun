from django.urls import path, include
from rest_framework.routers import DefaultRouter
from src.master.views import MasterViewSet  # , export_inventory_excel

router = DefaultRouter()
router.register(r'master', MasterViewSet, basename='master')
app_name = 'inventory'

urlpatterns = [
	path('', include(router.urls), name='master'),
	# path('export-inventory/<int:document_registry_id>/', export_inventory_excel, name='export_inventory_excel'),
]
