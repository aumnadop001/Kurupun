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
        # Create workbook and worksheet
        wb = Workbook()
        ws = wb.active
        ws.title = "Inventory"

        # Define styles
        header_font = Font(bold=True, size=11)
        center_align = Alignment(horizontal="center", vertical="center", wrap_text=True)
        thin_border = Border(
            left=Side(style="thin"),
            right=Side(style="thin"),
            top=Side(style="thin"),
            bottom=Side(style="thin"),
        )
        header_fill = PatternFill(
            start_color="D3D3D3", end_color="D3D3D3", fill_type="solid"
        )

        # Set column widths (approximate)
        column_widths = [
            10,
            19,
            10,
            10,
            11,
            11,
            10,
            9,
            10,
            8,
            12,
            22,
            8,
            8,
            8,
            8,
            8,
            10,
        ]
        for idx, width in enumerate(column_widths, start=1):
            ws.column_dimensions[ws.cell(row=1, column=idx).column_letter].width = width

        # Row 1-2: Main headers
        # ว.ด.ป. (A1:B2)
        ws.merge_cells("A1:B2")
        cell = ws["A1"]
        cell.value = "ว.ด.ป."
        cell.font = header_font
        cell.alignment = center_align
        cell.border = thin_border
        cell.fill = header_fill

        # หมายเลขพัสดุ (C1:D1)
        ws.merge_cells("C1:D1")
        cell = ws["C1"]
        cell.value = "หมายเลขพัสดุ"
        cell.font = header_font
        cell.alignment = center_align
        cell.border = thin_border
        cell.fill = header_fill

        # Empty headers (E1:H1)
        for col in ["E", "F", "G", "H"]:
            cell = ws[f"{col}1"]
            cell.value = ""
            cell.font = header_font
            cell.alignment = center_align
            cell.border = thin_border
            cell.fill = header_fill

        # รายการ (I1:N2)
        ws.merge_cells("I1:N2")
        cell = ws["I1"]
        cell.value = "รายการ"
        cell.font = header_font
        cell.alignment = center_align
        cell.border = thin_border
        cell.fill = header_fill

        # หน่วยนับ (O1:P2)
        ws.merge_cells("O1:P2")
        cell = ws["O1"]
        cell.value = "หน่วยนับ"
        cell.font = header_font
        cell.alignment = center_align
        cell.border = thin_border
        cell.fill = header_fill

        # ที่เก็บ (Q1:R2)
        ws.merge_cells("Q1:R2")
        cell = ws["Q1"]
        cell.value = "ที่เก็บ"
        cell.font = header_font
        cell.alignment = center_align
        cell.border = thin_border
        cell.fill = header_fill

        # Row 2: Sub headers
        ws["C2"] = "วัน"
        ws["D2"] = "จำนวน"

        # หมายเลขพัสดุแทนกันได้ (E2:H2)
        ws.merge_cells("E2:H2")
        cell = ws["E2"]
        cell.value = "หมายเลขพัสดุแทนกันได้"
        cell.font = header_font
        cell.alignment = center_align
        cell.border = thin_border
        cell.fill = header_fill

        for col in ["C", "D"]:
            cell = ws[f"{col}2"]
            cell.font = header_font
            cell.alignment = center_align
            cell.border = thin_border
            cell.fill = header_fill

        # Row 3-5: Criteria rows
        criteria_rows = [(3, "เกณฑ์สั่ง"), (4, "จุดสั่งเพิ่มเติม"), (5, "เกณฑ์ปลอดภัย")]

        for row_num, label in criteria_rows:
            ws.merge_cells(f"A{row_num}:B{row_num}")
            cell = ws[f"A{row_num}"]
            cell.value = label
            cell.font = header_font
            cell.alignment = center_align
            cell.border = thin_border
            cell.fill = header_fill

            for col in ["C", "D"]:
                cell = ws[f"{col}{row_num}"]
                cell.value = ""
                cell.alignment = center_align
                cell.border = thin_border

        # Merge E3:H5 (empty)
        ws.merge_cells("E3:H5")
        cell = ws["E3"]
        cell.value = ""
        cell.alignment = center_align
        cell.border = thin_border

        # ครุภัณฑ์ที่เกี่ยวข้อง (I3:N5)
        ws.merge_cells("I3:N5")
        cell = ws["I3"]
        cell.value = "ครุภัณฑ์ที่เกี่ยวข้อง"
        cell.font = header_font
        cell.alignment = center_align
        cell.border = thin_border
        cell.fill = header_fill

        # หมายเหตุ (O3:R5)
        ws.merge_cells("O3:R5")
        cell = ws["O3"]
        cell.value = "หมายเหตุ"
        cell.font = header_font
        cell.alignment = center_align
        cell.border = thin_border
        cell.fill = header_fill

        # Row 6: Section headers
        ws.merge_cells("A6:H6")
        cell = ws["A6"]
        cell.value = "ค้างรับ และ ค้างจ่าย"
        cell.font = header_font
        cell.alignment = center_align
        cell.border = thin_border
        cell.fill = header_fill

        ws.merge_cells("I6:R6")
        cell = ws["I6"]
        cell.value = "ความต้องการรับและจ่าย"
        cell.font = header_font
        cell.alignment = center_align
        cell.border = thin_border
        cell.fill = header_fill

        # Row 7-8: Detail headers
        detail_headers = [
            ("A7:A8", "ว.ด.ป."),
            ("B7:B8", "หลักฐาน"),
            ("C7:C8", "หน่วย"),
            ("D7:D8", "จำนวน"),
            ("E7:E8", "รับ/ค้าง"),
            ("F7:F8", "รับ/ค้าง"),
            ("G7:G8", "รับ/ค้าง"),
            ("H7:H8", "รับ/ค้าง"),
            ("I7:I8", "ว.ด.ป."),
            ("J7:J8", "รับ"),
            ("K7:K8", "ราคาต่อหน่วย"),
            ("L7:L8", "หลักฐาน"),
            ("O7:O8", "จ่าย"),
            ("P7:P8", "รวมยืม"),
            ("Q7:Q8", "คงคลัง"),
            ("R7:R8", "ลายมือชื่อ"),
        ]

        for cell_range, value in detail_headers:
            ws.merge_cells(cell_range)
            cell = ws[cell_range.split(":")[0]]
            cell.value = value
            cell.font = header_font
            cell.alignment = center_align
            cell.border = thin_border
            cell.fill = header_fill

        # ความต้องการ (M7:N7)
        ws.merge_cells("M7:N7")
        cell = ws["M7"]
        cell.value = "ความต้องการ"
        cell.font = header_font
        cell.alignment = center_align
        cell.border = thin_border
        cell.fill = header_fill

        ws["M8"] = "ขั้นต้น"
        ws["N8"] = "ทดแทน"

        for col in ["M", "N"]:
            cell = ws[f"{col}8"]
            cell.font = header_font
            cell.alignment = center_align
            cell.border = thin_border
            cell.fill = header_fill

        # Add empty data rows (optional - can add more rows as needed)
        for row in range(9, 20):  # Add 11 empty rows for data
            for col in range(1, 19):  # Columns A to R
                cell = ws.cell(row=row, column=col)
                cell.value = ""
                cell.border = thin_border
                cell.alignment = center_align

        # Prepare response
        response = HttpResponse(content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        response["Content-Disposition"] = (f'attachment; filename="inventory_template_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx"')

        wb.save(response)
        return response

    except Exception as e:
        return HttpResponse(f"Error: {str(e)}", status=500)
