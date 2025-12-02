from django.contrib import admin
from src.document_control import models


class ItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "get_item_id",
        "get_item_name",
        "unit",
        "storage_location",
        "is_active",
    )
    list_filter = ("is_active",)
    search_fields = ("description__Des_name", "storage_location", "description__Des_id")
    ordering = ("id",)
    raw_id_fields = ("description",)

    def get_item_id(self, obj):
        return obj.get_item_id

    get_item_id.short_description = "Item ID"

    def get_item_name(self, obj):
        return obj.name

    get_item_name.short_description = "Name"


class AlternativeItemAdmin(admin.ModelAdmin):
    list_display = ("id", "item", "alternative_item", "created_at")
    search_fields = (
        "item__description__Des_name",
        "alternative_item__description__Des_name",
    )
    raw_id_fields = ("item", "alternative_item")


class RelatedEquipmentAdmin(admin.ModelAdmin):
    list_display = ("id", "item", "equipment_name", "equipment_code", "created_at")
    search_fields = ("item__description__Des_name", "equipment_name", "equipment_code")
    raw_id_fields = ("item",)


class PendingTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "item",
        "transaction_type",
        "date",
        "quantity",
        "is_resolved",
    )
    list_filter = ("transaction_type", "is_resolved", "date")
    search_fields = ("item__description__Des_name", "document_no")
    ordering = ("-date",)
    raw_id_fields = ("item",)


class StockTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "item",
        "date",
        "receive_quantity",
        "issue_quantity",
        "stock_balance",
    )
    list_filter = ("date",)
    search_fields = ("item__description__Des_name", "receive_document_no")
    ordering = ("-date",)
    raw_id_fields = ("item",)
    readonly_fields = ("stock_balance", "created_at", "updated_at")


admin.site.register(models.Item, ItemAdmin)
admin.site.register(models.AlternativeItem, AlternativeItemAdmin)
admin.site.register(models.RelatedEquipment, RelatedEquipmentAdmin)
admin.site.register(models.PendingTransaction, PendingTransactionAdmin)
admin.site.register(models.StockTransaction, StockTransactionAdmin)
