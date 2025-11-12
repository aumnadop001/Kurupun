from django.contrib import admin
from src.documentRegistry.models import DocumentRegistry
# Register your models here.

class DocumentRegistryAdmin(admin.ModelAdmin):
    list_display = ('registry_number', 'registration_date', 'document_title', 'sender', 'storage_date')
    search_fields = ('registry_number', 'document_title', 'sender')
    list_filter = ('storage_date','registration_date')

admin.site.register(DocumentRegistry, DocumentRegistryAdmin)