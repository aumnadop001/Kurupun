from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import viewsets
from src.master import models, serializers


class MasterViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def list(self, request):
        response = {
            "ptype": serializers.ptypeSerializer(models.ptype.objects.all(), many=True).data,
            "pClass": serializers.pClassSerializer(models.pClass.objects.all(), many=True).data,
            "gpscode": serializers.gpscodeSerializer(models.gpscode.objects.all(), many=True).data,
            "dept": serializers.deptSerializer(models.dept.objects.all(), many=True).data,
            "invoiceType": serializers.invoiceTypeSerializer(models.invoiceType.objects.all(), many=True).data,
        }
        return Response(response)


