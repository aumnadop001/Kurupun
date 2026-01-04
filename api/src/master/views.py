from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from src.master import models, serializers
from rest_framework.pagination import PageNumberPagination
import sys
from django.db.models import Q, Value, CharField
from django.db.models.functions import Concat, Coalesce

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = "page_size"
    max_page_size = 1000


class MasterViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination

    def list(self, request):
        response = {
            "ptype": serializers.ptypeSerializer(
                models.ptype.objects.all(), many=True
            ).data,
            "pClass": serializers.pClassSerializer(
                models.pClass.objects.all(), many=True
            ).data,
            "gpscode": serializers.gpscodeSerializer(
                models.gpscode.objects.all(), many=True
            ).data,
            "dept": serializers.deptSerializer(
                models.dept.objects.all(), many=True
            ).data,
            "invoiceType": serializers.invoiceTypeSerializer(
                models.invoiceType.objects.all(), many=True
            ).data,
        }
        # pagination_class = StandardResultsSetPagination
        return Response({"results": response})


class DescriptionViewSet(viewsets.ModelViewSet):
    """ViewSet for Description CRUD operations"""

    queryset = models.Description.objects.all()
    serializer_class = serializers.DescriptionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["class_id", "type_id", "gpsc_id"]
    search_fields = ["Des_name", "Des_id", "keyword","item_id"]
    ordering_fields = ["created_at", "Des_id"]
    ordering = ["class_id", "type_id", "Des_id"]
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        pagination_class = StandardResultsSetPagination
        if self.action == "list":
            return serializers.DescriptionListSerializer
        return serializers.DescriptionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.annotate(
                item_id=Concat(
                    Coalesce("class_id__class_id", Value("")),
                    Value("-"),
                    Coalesce("type_id__ptype_id", Value("")),
                    Value("-"),
                    Coalesce("Des_id", Value("")),
                    output_field=CharField(),
                )
            ).filter(
                Q(item_id__icontains=search) |
                Q(Des_name__icontains=search) |
                Q(keyword__icontains=search)
            )

        return queryset
