from rest_framework import serializers
from .models import DocumentRecord, Inventory


class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = "__all__"
        read_only_fields = ["id"]


class DocumentRecordSerializer(serializers.ModelSerializer):
    inventories = InventorySerializer(many=True, read_only=True)
    inventories_count = serializers.SerializerMethodField()

    class Meta:
        model = DocumentRecord
        fields = "__all__"
        read_only_fields = ["id"]

    def get_inventories_count(self, obj):
        return obj.inventories.count()
