from django.contrib import admin
from src.master.models import ptype, pClass, gpscode, invoiceType, Description


class DescriptionAdmin(admin.ModelAdmin):
    list_display = ("id", "get_item_id", "Des_name", "class_id", "type_id", "gpsc_id")
    list_filter = ("class_id", "type_id")
    search_fields = ("Des_name", "Des_id", "keyword")
    ordering = ("class_id", "type_id", "Des_id")
    raw_id_fields = ("class_id", "type_id", "gpsc_id")

    def get_item_id(self, obj):
        return obj.get_item_id()

    get_item_id.short_description = "Item ID"


admin.site.register(ptype)
admin.site.register(pClass)
admin.site.register(gpscode)
admin.site.register(invoiceType)
admin.site.register(Description, DescriptionAdmin)
