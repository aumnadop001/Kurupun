from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import DocumentRecord, Inventory, InventoryTransaction
from .serializers import DocumentRecordSerializer, InventorySerializer, InventoryTransactionSerializer
from .excel_export import generate_excel_response, generate_table_excel_response
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

    queryset = DocumentRecord.objects.select_related("inventory").all().order_by('-id')
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
        "-id"
        # "registration_date",
        # "file_storage_date",
        # "registration_number",
        # "days_to_order",
        # "quantity_to_order",
        # "safety_stock_quantity",
    ]
    ordering = ["-id"]  # Default ordering

    def get_queryset(self):
        """Override to ensure ordering by -id is always applied"""
        return super().get_queryset().order_by('-id')

    @action(detail=False, methods=["get"], url_path="next-register-no")
    def next_register_no(self, request):
        """Generate next register number based on date"""
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({'error': 'Date parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # แปลงวันที่จาก YYYY-MM-DD เป็นปี พ.ศ. 2 หลัก
            from datetime import datetime
            date_obj = datetime.strptime(date_str, '%Y-%m-%d')
            year_ad = date_obj.year
            year_be = year_ad + 543
            year_suffix = str(year_be)[-2:]  # เอา 2 หลักสุดท้าย เช่น 2568 -> 68
            
            # ดึงเลขทะเบียนล่าสุดของปีนี้
            latest = DocumentRecord.objects.filter(
                registerNo__endswith=f'-{year_suffix}'
            ).order_by('-registerNo').first()
            
            if latest and latest.registerNo:
                # แยกเลขลำดับออกมา (0001 จาก 0001-68)
                try:
                    number = int(latest.registerNo.split('-')[0])
                    next_number = number + 1
                except (ValueError, IndexError):
                    next_number = 1
            else:
                next_number = 1
            
            register_no = f"{next_number:04d}-{year_suffix}"
            return Response({'registerNo': register_no})
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=["get"])
    def inventory(self, request, pk=None):
        """Get inventory for a specific document record"""
        document_record = self.get_object()
        try:
            inventory = document_record.inventory
            serializer = InventorySerializer(inventory)
            return Response(serializer.data)
        except Inventory.DoesNotExist:
            return Response({'detail': 'Inventory not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=["get"], url_path="total-stock-balance")
    def total_stock_balance(self, request, pk=None):
        """Get stock balance from the inventory record"""
        document_record = self.get_object()
        
        try:
            inventory = document_record.inventory
            total_stock_balance = inventory.stock_balance or 0
        except Inventory.DoesNotExist:
            total_stock_balance = 0
        
        return Response({'total_stock_balance': total_stock_balance})

    @action(detail=True, methods=["get"], url_path="export-excel")
    def export_excel(self, request, pk=None):
        """Export document record with inventories to Excel file"""
        document_record = self.get_object()
        return generate_excel_response(document_record)

    @action(detail=False, methods=["get"], url_path="export-documents")
    def export_documents(self, request):
        """Export all document records as table to Excel file"""
        # ใช้ queryset ที่มี filter เดียวกับ list
        queryset = self.filter_queryset(self.get_queryset())
        
        # ถ้าต้องการ export ทั้งหมดไม่มี pagination
        document_records = queryset.all()
        
        return generate_table_excel_response(document_records)


class InventoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Inventory CRUD operations
    Supports filtering and search
    """

    queryset = Inventory.objects.select_related("document_record").all().order_by('-id')
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
        "id"
        # "pending_date",
        # "request_date",
        # "stock_balance",
        # "received_quantity",
        # "issue_quantity",
        # "unit_price",
    ]
    ordering = ["-id"]  # Default ordering

    def get_queryset(self):
        """Override to ensure ordering by -id is always applied"""
        return super().get_queryset().order_by('-id')

    @action(detail=True, methods=["post"], url_path="add-transaction")
    def add_transaction(self, request, pk=None):
        """Add a new transaction (receive or issue) to inventory"""
        inventory = self.get_object()
        
        serializer = InventoryTransactionSerializer(data=request.data)
        if serializer.is_valid():
            # Create transaction
            transaction = serializer.save(inventory=inventory)
            
            # Recalculate stock balance
            inventory.calculate_stock_balance()
            
            return Response({
                'transaction': InventoryTransactionSerializer(transaction).data,
                'stock_balance': inventory.stock_balance
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"], url_path="transactions")
    def get_transactions(self, request, pk=None):
        """Get all transactions for this inventory"""
        inventory = self.get_object()
        transactions = inventory.transactions.all()
        serializer = InventoryTransactionSerializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["delete"], url_path="clear-transactions")
    def clear_transactions(self, request, pk=None):
        """Clear all transactions for this inventory"""
        inventory = self.get_object()
        count = inventory.transactions.all().delete()[0]
        
        # Reset stock balance
        inventory.stock_balance = inventory.previous_stock_balance
        inventory.save(update_fields=['stock_balance'])
        
        return Response({
            'deleted_count': count,
            'message': f'Deleted {count} transactions'
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="latest-stock-balance")
    def latest_stock_balance(self, request):
        """Get latest stock balance for a specific document record"""
        document_record_id = request.query_params.get('document_record')
        if not document_record_id:
            return Response({'stock_balance': 0})
        
        try:
            # ดึง inventory ล่าสุดของ document_record นี้
            latest_inventory = Inventory.objects.filter(
                document_record_id=document_record_id
            ).order_by('-request_date', '-id').first()
            
            if latest_inventory:
                return Response({'stock_balance': latest_inventory.stock_balance or 0})
            else:
                return Response({'stock_balance': 0})
        except Exception as e:
            return Response({'error': str(e), 'stock_balance': 0}, status=status.HTTP_400_BAD_REQUEST)
