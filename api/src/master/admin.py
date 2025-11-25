from django.contrib import admin
from src.master.models import InventoryRecord, ptype, pClass, gpscode, invoiceType

# Register your models here.


class adminInventoryRecord(admin.ModelAdmin):
    list_display = ("class_id", "type_id", "des_id", "des_name", "gpsc_id", "keyword")
    search_fields = ("des_id", "des_name", "keyword")
    list_filter = ("class_id", "type_id", "gpsc_id")


admin.site.register(InventoryRecord, adminInventoryRecord)
admin.site.register(ptype)
admin.site.register(pClass)
admin.site.register(gpscode)
admin.site.register(invoiceType)