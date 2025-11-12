from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentRegistryViewSet

router = DefaultRouter()
router.register(r'document-registries', DocumentRegistryViewSet, basename='documentregistry')

app_name = 'document_registry'

urlpatterns = [
	path('', include(router.urls), name='document_registry'),
]
