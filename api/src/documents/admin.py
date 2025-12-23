from django.contrib import admin
from src.documents.models import DocumentRecord, Inventory

# Register your models here.


class DocumentRecordAdmin(admin.ModelAdmin):
    list_display = (
        "registerNo",
        "registration_number",
        "registration_date",
        "document_type",
        "sender",
        "recipient",
        "first_item",
        "inventory_number",
        "unit_of_measure",
        "file_storage_date",
        "related_document_number",
    )
    search_fields = ("registration_number", "document_type", "sender", "recipient")
    list_filter = ("document_type", "registration_date")


admin.site.register(DocumentRecord, DocumentRecordAdmin)


class InventoryAdmin(admin.ModelAdmin):
    list_display = (
        "pending_date",
        "pending_evidence",
        "pending_unit",
        "pending_quantity",
        "pending_receive1",
        "pending_balance1",
        "pending_receive2",
        "pending_balance2",
        "pending_receive3",
        "pending_balance3",
        "pending_receive4",
        "pending_balance4",
        "pending_signature",
        "request_date",
        "received_quantity",
        "unit_price",
        "request_evidence",
        "request_type",
        "issue_quantity",
        "total_borrowed",
        "stock_balance",
        "request_signature",
    )
    search_fields = ("pending_evidence", "request_evidence")
    list_filter = ("request_type", "pending_date", "request_date")


admin.site.register(Inventory, InventoryAdmin)
