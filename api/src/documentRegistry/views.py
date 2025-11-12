from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny

from .models import DocumentRegistry
from .serializers import DocumentRegistrySerializer


class DocumentRegistryViewSet(viewsets.ModelViewSet):
	"""Simple ModelViewSet for DocumentRegistry

	- list/retrieve/create/update/destroy
	- supports search on several text fields and ordering
	"""
	queryset = DocumentRegistry.objects.all()
	serializer_class = DocumentRegistrySerializer
	permission_classes = [AllowAny]
	filter_backends = [filters.SearchFilter, filters.OrderingFilter]
	search_fields = [
		'registry_number',
		'document_title',
		'sender',
		'related_document_number',
		'withdrawal_set_number',
	]
	ordering_fields = ['registration_date', 'storage_date', 'registry_number']
	ordering = ['-registration_date']
