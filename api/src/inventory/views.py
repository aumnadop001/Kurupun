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

