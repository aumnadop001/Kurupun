from rest_framework import serializers
from .models import DocumentRecord, Inventory, InventoryTransaction


class InventoryTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryTransaction
        fields = "__all__"
        read_only_fields = ["id", "created_at", "inventory"]
        extra_kwargs = {
            'inventory': {'required': False}
        }


class InventorySerializer(serializers.ModelSerializer):
    # เพิ่ม field DocumentRecord.inventory_number ใน serializer นี้
    document_record_inventory_number = serializers.CharField(source='document_record.inventory_number', read_only=True)
    document_record_register_no = serializers.CharField(source='document_record.registerNo', read_only=True)
    # หน่่วยนับ
    unit_item = serializers.CharField(source='document_record.unit_of_measure', read_only=True)
    # first_item
    first_item = serializers.CharField(source='document_record.first_item', read_only=True)
    # รายการ transactions ทั้งหมด
    transactions = InventoryTransactionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Inventory
        fields = "__all__"
        read_only_fields = ["id", "stock_balance"]


class DocumentRecordSerializer(serializers.ModelSerializer):
    inventories = serializers.SerializerMethodField()
    inventories_count = serializers.SerializerMethodField()

    class Meta:
        model = DocumentRecord
        fields = "__all__"
        read_only_fields = ["id"]

    def get_inventories(self, obj):
        # ดึง inventories จากทุก DocumentRecord ที่มี registration_number เดียวกัน
        all_inventories = Inventory.objects.filter(
            document_record__registration_number=obj.registration_number
        ).select_related('document_record').order_by('-id')
        return InventorySerializer(all_inventories, many=True).data

    def get_inventories_count(self, obj):
        # นับ inventories จากทุก DocumentRecord ที่มี registration_number เดียวกัน
        return Inventory.objects.filter(
            document_record__registration_number=obj.registration_number
        ).count()
