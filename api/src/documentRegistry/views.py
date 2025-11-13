from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
import django_filters
from django.http import HttpResponse
from openpyxl import Workbook
from .models import DocumentRegistry
from .serializers import DocumentRegistrySerializer


class DocumentRegistryPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
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


def export_excel(request):
    # สร้าง Workbook และเลือก Sheet แรก
    wb = Workbook()
    ws = wb.active
    ws.title = "Documents"

    # เขียนหัวตาราง
    ws.append(["ทะเบียนที่", "วันที่ลงทะเบียน", "เอกสาร", "จาก", "รายการแรก"])

    # ดึงข้อมูลจากฐานข้อมูล
    for doc in Document.objects.all():
        ws.append(
            [
                doc.registry_number,
                doc.registration_date.strftime("%d/%m/%Y"),
                doc.document_title,
                doc.sender,
                doc.first_item,
            ]
        )

    # สร้าง Response เพื่อให้ browser ดาวน์โหลดไฟล์
    response = HttpResponse(
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    currentDate = datetime.now().strftime("%Y-%m-%d")
    filename = "{}_{}.xlsx".format("ทะเบียนคุมเอกสาร", currentDate)
    response["Content-Disposition"] = f'attachment; filename="{filename}"'

    wb.save(response)
    return response
