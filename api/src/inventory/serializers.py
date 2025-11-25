from rest_framework import serializers
from src.master.models import InventoryRecord


class InventoryRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryRecord
        fields = '__all__'
