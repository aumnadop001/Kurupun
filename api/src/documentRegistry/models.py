from django.db import models

# Create your models here.

class DocumentRegistry(models.Model):
    registry_number = models.CharField(max_length=255, verbose_name="ทะเบียนที่")
    registration_date = models.DateField(verbose_name="วันที่ลงทะเบียน")
    document_title = models.CharField(max_length=255, verbose_name="เอกสาร")
    sender = models.CharField(max_length=255, verbose_name="จาก")
    first_item = models.CharField(max_length=255, verbose_name="รายการแรกในเอกสาร")
    storage_date = models.DateField(verbose_name="วันที่เก็บเข้าแฟ้ม")
    related_document_number = models.CharField(max_length=255, verbose_name="เลขที่เอกสารที่เกี่ยวข้อง")
    withdrawal_set_number = models.CharField(max_length=255, verbose_name="เลขที่ชุดเบิก")
    notes = models.TextField(blank=True, null=True, verbose_name="หมายเหตุ")

    class Meta:
        verbose_name = "Document Registry"
        verbose_name_plural = "Document Registries"
        ordering = ['-registration_date']

    def __str__(self):
        return f"Registry {self.registry_number}: {self.document_title}"

