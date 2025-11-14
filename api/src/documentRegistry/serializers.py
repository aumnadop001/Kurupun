from rest_framework import serializers
from .models import DocumentRegistry, InventoryRecord


class DocumentRegistrySerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentRegistry
        fields = '__all__'


class InventoryRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryRecord
        fields = '__all__'
