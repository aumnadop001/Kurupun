from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import DocumentRecord, Inventory
from .serializers import DocumentRecordSerializer, InventorySerializer
from .excel_export import generate_excel_response
from rest_framework.pagination import PageNumberPagination


# Pagination
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class DocumentRecordViewSet(viewsets.ModelViewSet):
    """
    ViewSet for DocumentRecord CRUD operations
    Supports filtering and search
    """

    queryset = DocumentRecord.objects.prefetch_related("inventories").all()
    serializer_class = DocumentRecordSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    # Fields that can be filtered exactly
    filterset_fields = [
        "registration_number",
        "document_type",
        "registration_date",
        "sender",
        "recipient",
        "storage_location",
    ]

    # Fields that can be searched (partial match)
    search_fields = [
        "registration_number",
        "document_type",
        "sender",
        "recipient",
        "first_item",
        "inventory_number",
        "related_document_number",
        "remark",
        "storage_location",
    ]

    # Fields that can be used for ordering
    ordering_fields = [
        "registration_date",
        "file_storage_date",
        "registration_number",
        "days_to_order",
        "quantity_to_order",
        "safety_stock_quantity",
    ]
    ordering = ["-registration_date"]  # Default ordering

    @action(detail=True, methods=["get"])
    def inventories(self, request, pk=None):
        """Get all inventories for a specific document record"""
        document_record = self.get_object()
        inventories = document_record.inventories.all()
        serializer = InventorySerializer(inventories, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], url_path="export-excel")
    def export_excel(self, request, pk=None):
        """Export document record with inventories to Excel file"""
        document_record = self.get_object()
        return generate_excel_response(document_record)


class InventoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Inventory CRUD operations
    Supports filtering and search
    """

    queryset = Inventory.objects.select_related("document_record").all()
    serializer_class = InventorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    # Fields that can be filtered exactly
    filterset_fields = [
        "document_record",
        "request_type",
        "pending_date",
        "request_date",
    ]

    # Fields that can be searched (partial match)
    search_fields = [
        "pending_evidence",
        "pending_unit",
        "request_evidence",
        "pending_signature",
        "request_signature",
        "document_record__registration_number",  # Search by document registration number
    ]

    # Fields that can be used for ordering
    ordering_fields = [
        "pending_date",
        "request_date",
        "stock_balance",
        "received_quantity",
        "issue_quantity",
        "unit_price",
    ]
    ordering = ["-request_date"]  # Default ordering
