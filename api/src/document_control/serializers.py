from rest_framework import serializers
from src.document_control.models import (
    Item,
    AlternativeItem,
    RelatedEquipment,
    PendingTransaction,
    StockTransaction,
)
from src.master.models import Description
from src.master.serializers import pClassSerializer, ptypeSerializer, gpscodeSerializer


class DescriptionNestedSerializer(serializers.Serializer):
    """Nested serializer for Description data - Read Only"""
    id = serializers.IntegerField()
    class_id = serializers.CharField(source="class_id.class_id")
    class_name = serializers.CharField(source="class_id.class_name")
    type_id = serializers.CharField(source="type_id.ptype_id")
    type_name = serializers.CharField(source="type_id.ptype_name")
    Des_id = serializers.CharField()
    Des_name = serializers.CharField()
    gpsc_id = serializers.CharField(source="gpsc_id.gpsc_id", allow_null=True)
    gpsc_name = serializers.CharField(source="gpsc_id.gpsc_name", allow_null=True)
    keyword = serializers.CharField(allow_null=True)
    item_id = serializers.SerializerMethodField()

    def get_item_id(self, obj):
        return obj.get_item_id()
    
    def update(self, instance, validated_data):
        """This serializer is read-only, update not supported"""
        raise NotImplementedError("DescriptionNestedSerializer is read-only")
    
    def create(self, validated_data):
        """This serializer is read-only, create not supported"""
        raise NotImplementedError("DescriptionNestedSerializer is read-only")


class DescriptionSerializer(serializers.ModelSerializer):
    """Full ModelSerializer for Description CRUD operations"""
    class_id = serializers.CharField(source="class_id.class_id", read_only=True)
    class_name = serializers.CharField(source="class_id.class_name", read_only=True)
    type_id = serializers.CharField(source="type_id.ptype_id", read_only=True)
    type_name = serializers.CharField(source="type_id.ptype_name", read_only=True)
    gpsc_id = serializers.CharField(source="gpsc_id.gpsc_id", read_only=True, allow_null=True)
    gpsc_name = serializers.CharField(source="gpsc_id.gpsc_name", read_only=True, allow_null=True)
    item_id = serializers.SerializerMethodField(read_only=True)

    def get_item_id(self, obj):
        return obj.get_item_id()

    class Meta:
        model = Description
        fields = [
            "id",
            "class_id",
            "class_name",
            "type_id",
            "type_name",
            "Des_id",
            "Des_name",
            "gpsc_id",
            "gpsc_name",
            "keyword",
            "item_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AlternativeItemSerializer(serializers.ModelSerializer):
    """Serializer for AlternativeItem model"""

    item_id = serializers.CharField(source="item.get_item_id", read_only=True)
    item_name = serializers.CharField(source="item.name", read_only=True)
    alternative_item_id = serializers.CharField(
        source="alternative_item.get_item_id", read_only=True
    )
    alternative_item_name = serializers.CharField(
        source="alternative_item.name", read_only=True
    )

    class Meta:
        model = AlternativeItem
        fields = [
            "id",
            "item",
            "item_id",
            "item_name",
            "alternative_item",
            "alternative_item_id",
            "alternative_item_name",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class RelatedEquipmentSerializer(serializers.ModelSerializer):
    """Serializer for RelatedEquipment model"""

    item_id = serializers.CharField(source="item.get_item_id", read_only=True)
    item_name = serializers.CharField(source="item.name", read_only=True)

    class Meta:
        model = RelatedEquipment
        fields = [
            "id",
            "item",
            "item_id",
            "item_name",
            "equipment_name",
            "equipment_code",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class ItemSerializer(serializers.ModelSerializer):
    """Serializer for Item model"""

    description_detail = DescriptionNestedSerializer(source="description", read_only=True)
    item_id = serializers.CharField(source="get_item_id", read_only=True)
    name = serializers.CharField(source="description.Des_name", read_only=True)
    alternatives = AlternativeItemSerializer(many=True, read_only=True)
    related_equipments = RelatedEquipmentSerializer(many=True, read_only=True)
    pending_transactions = serializers.SerializerMethodField()
    transactions = serializers.SerializerMethodField()

    def get_pending_transactions(self, obj):
        from src.document_control.models import PendingTransaction
        pending = PendingTransaction.objects.filter(item=obj)
        return PendingTransactionSerializer(pending, many=True).data
    
    def get_transactions(self, obj):
        from src.document_control.models import StockTransaction
        transactions = StockTransaction.objects.filter(item=obj).order_by('date')
        return StockTransactionSerializer(transactions, many=True).data

    class Meta:
        model = Item
        fields = [
            "id",
            "description",
            "description_detail",
            "item_id",
            "name",
            "unit",
            "storage_location",
            "order_criteria_day",
            "order_criteria_quantity",
            "additional_order_point_day",
            "additional_order_point_quantity",
            "safety_criteria_day",
            "safety_criteria_quantity",
            "pending_received_1",
            "pending_received_2",
            "pending_received_3",
            "pending_received_4",
            "notes",
            "is_active",
            "alternatives",
            "related_equipments",
            "pending_transactions",
            "transactions",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ItemListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing items"""

    item_id = serializers.CharField(source="get_item_id", read_only=True)
    name = serializers.CharField(source="description.Des_name", read_only=True)
    class_name = serializers.CharField(
        source="description.class_id.class_name", read_only=True
    )
    type_name = serializers.CharField(
        source="description.type_id.ptype_name", read_only=True
    )

    class Meta:
        model = Item
        fields = [
            "id",
            "item_id",
            "name",
            "class_name",
            "type_name",
            "unit",
            "storage_location",
            "is_active",
        ]


class PendingTransactionSerializer(serializers.ModelSerializer):
    """Serializer for PendingTransaction model"""

    item_id = serializers.CharField(source="item.get_item_id", read_only=True)
    item_name = serializers.CharField(source="item.name", read_only=True)
    transaction_type_display = serializers.CharField(
        source="get_transaction_type_display", read_only=True
    )

    class Meta:
        model = PendingTransaction
        fields = [
            "id",
            "item",
            "item_id",
            "item_name",
            "transaction_type",
            "transaction_type_display",
            "date",
            "document_no",
            "unit",
            "quantity",
            "is_resolved",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class StockTransactionSerializer(serializers.ModelSerializer):
    """Serializer for StockTransaction model"""

    item_id = serializers.CharField(source="item.get_item_id", read_only=True)
    item_name = serializers.CharField(source="item.name", read_only=True)

    class Meta:
        model = StockTransaction
        fields = [
            "id",
            "item",
            "item_id",
            "item_name",
            "date",
            "receive_quantity",
            "unit_price",
            "receive_document_no",
            "initial_demand",
            "replacement_demand",
            "issue_quantity",
            "total_borrowed",
            "stock_balance",
            "signature",
            "notes",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "stock_balance", "created_at", "updated_at"]


class StockCardExportSerializer(serializers.Serializer):
    """Serializer for exporting stock card to Excel"""

    item_id = serializers.IntegerField(required=True)
    start_date = serializers.DateField(required=False, allow_null=True)
    end_date = serializers.DateField(required=False, allow_null=True)
