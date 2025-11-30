from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view, permission_classes
from django_filters.rest_framework import DjangoFilterBackend
import django_filters
from django.http import HttpResponse
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
from datetime import datetime
from src.master.models import InventoryRecord
from src.inventory.serializers import InventoryRecordSerializer

class InventoryRecordPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class InventoryRecordFilter(django_filters.FilterSet):
    class_id = django_filters.CharFilter(field_name="class_id", lookup_expr="icontains")
    type_id = django_filters.CharFilter(field_name="type_id", lookup_expr="icontains")
    des_id = django_filters.CharFilter(field_name="des_id", lookup_expr="icontains")
    des_name = django_filters.CharFilter(field_name="des_name", lookup_expr="icontains")
    gpsc_id = django_filters.CharFilter(field_name="gpsc_id", lookup_expr="icontains")
    keyword = django_filters.CharFilter(field_name="keyword", lookup_expr="icontains")

    class Meta:
        model = InventoryRecord
        fields = [
            "class_id",
            "type_id",
            "des_id",
            "des_name",
            "gpsc_id",
            "keyword",
        ]

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = InventoryRecord.objects.all()
    serializer_class = InventoryRecordSerializer
    permission_classes = [AllowAny]
    pagination_class = InventoryRecordPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = InventoryRecordFilter
    search_fields = [
        "sender",
    ]
    ordering_fields = ["sender"]
    # ordering = ["-sender"]


@api_view(["GET"])
@permission_classes([AllowAny])
def export_inventory_excel(request):
    """Export all inventory records to Excel"""
    try:
        # Fetch all inventory records
        inventory_records = InventoryRecord.objects.all().order_by("id")

        # Create workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "บันทึกรายการพัสดุ"

        # Define styles
        bold_font = Font(bold=True)
        center_alignment = Alignment(
            horizontal="center", vertical="center", wrap_text=True
        )
        left_alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
        thin_border = Border(
            left=Side(style="thin"),
            right=Side(style="thin"),
            top=Side(style="thin"),
            bottom=Side(style="thin"),
        )
        header_fill = PatternFill(
            start_color="CCCCCC", end_color="CCCCCC", fill_type="solid"
        )

        # Set column widths
        ws.column_dimensions["A"].width = 5
        ws.column_dimensions["B"].width = 20
        ws.column_dimensions["C"].width = 20
        ws.column_dimensions["D"].width = 30
        ws.column_dimensions["E"].width = 20
        ws.column_dimensions["F"].width = 40

        # Headers
        headers = [
            "#",
            "รหัสประเภทพัสดุ",
            "รหัสรายละเอียดพัสดุ",
            "ชื่อรายละเอียดพัสดุ",
            "รหัสพัสดุตาม กพร.",
            "คำค้นหา",
        ]

        for col_num, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col_num)
            cell.value = header
            cell.font = bold_font
            cell.alignment = center_alignment
            cell.border = thin_border
            cell.fill = header_fill

        # Data rows
        for row_num, record in enumerate(inventory_records, 2):
            # Column A: #
            cell = ws.cell(row=row_num, column=1)
            cell.value = row_num - 1
            cell.alignment = center_alignment
            cell.border = thin_border

            # Column B: รหัสประเภทพัสดุ
            cell = ws.cell(row=row_num, column=2)
            cell.value = record.class_id.class_id if record.class_id else ""
            cell.alignment = center_alignment
            cell.border = thin_border

            # Column C: รหัสรายละเอียดพัสดุ
            cell = ws.cell(row=row_num, column=3)
            cell.value = record.des_id or ""
            cell.alignment = center_alignment
            cell.border = thin_border

            # Column D: ชื่อรายละเอียดพัสดุ
            cell = ws.cell(row=row_num, column=4)
            cell.value = record.des_name or ""
            cell.alignment = center_alignment
            cell.border = thin_border

            # Column E: รหัสพัสดุตาม กพร.
            cell = ws.cell(row=row_num, column=5)
            cell.value = record.gpsc_id.gpsc_id if record.gpsc_id else ""
            cell.alignment = center_alignment
            cell.border = thin_border

            # Column F: คำค้นหา
            cell = ws.cell(row=row_num, column=6)
            cell.value = record.keyword or ""
            cell.alignment = left_alignment
            cell.border = thin_border

        # Create HTTP response
        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        current_date = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"บัญชีคุมพัสดุ_{current_date}.xlsx"
        response["Content-Disposition"] = f'attachment; filename="{filename}"'

        wb.save(response)
        return response

    except Exception as e:
        return HttpResponse(f"Error: {str(e)}", status=500)
