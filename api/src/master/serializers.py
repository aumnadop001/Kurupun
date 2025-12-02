from rest_framework import serializers
from src.master.models import pClass, ptype, gpscode, dept, invoiceType, Description


class pClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = pClass
        fields = "__all__"


class ptypeSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source="class_id.class_name", read_only=True)

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


class DescriptionSerializer(serializers.ModelSerializer):
    """Serializer for Description model"""

    class_name = serializers.CharField(source="class_id.class_name", read_only=True)
    type_name = serializers.CharField(source="type_id.ptype_name", read_only=True)
    gpsc_name = serializers.CharField(source="gpsc_id.gpsc_name", read_only=True, allow_null=True)
    item_id = serializers.SerializerMethodField()

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

    def get_item_id(self, obj):
        return obj.get_item_id()


class DescriptionListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing descriptions"""

    class_name = serializers.CharField(source="class_id.class_name", read_only=True)
    type_name = serializers.CharField(source="type_id.ptype_name", read_only=True)
    item_id = serializers.SerializerMethodField()

    class Meta:
        model = Description
        fields = [
            "id",
            "item_id",
            "Des_name",
            "class_name",
            "type_name",
        ]

    def get_item_id(self, obj):
        return obj.get_item_id()

