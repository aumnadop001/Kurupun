from rest_framework import serializers
from src.master.models import InventoryRecord, pClass, ptype, gpscode, dept, invoiceType


class InventoryRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryRecord
        fields = "__all__"


class pClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = pClass
        fields = "__all__"


class ptypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ptype
        fields = "__all__"


class gpscodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = gpscode
        fields = "__all__"


class deptSerializer(serializers.ModelSerializer):
    class Meta:
        model = dept
        fields = "__all__"


class invoiceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = invoiceType
        fields = "__all__"
