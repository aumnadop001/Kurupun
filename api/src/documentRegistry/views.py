from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from .models import DocumentRegistry
from .serializers import DocumentRegistrySerializer


class DocumentRegistryPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class DocumentRegistryFilter(django_filters.FilterSet):
    registry_number = django_filters.CharFilter(lookup_expr="icontains")
    sender = django_filters.CharFilter(lookup_expr="icontains")

    class Meta:
        model = DocumentRegistry
        fields = ["registry_number", "sender"]


class DocumentRegistryViewSet(viewsets.ModelViewSet):
    queryset = DocumentRegistry.objects.all()
    serializer_class = DocumentRegistrySerializer
    permission_classes = [AllowAny]
    pagination_class = DocumentRegistryPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = DocumentRegistryFilter
    search_fields = [
        "registry_number",
        "document_title",
        "sender",
        "related_document_number",
        "withdrawal_set_number",
    ]
    ordering_fields = ["registration_date", "storage_date", "registry_number"]
    ordering = ["-registration_date"]