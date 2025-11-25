from django.db import models

class InventoryRecord(models.Model):
    class_id = models.CharField(max_length=100, verbose_name="รหัสคลังสินค้า",null=True, blank=True)
    type_id = models.CharField(max_length=100, verbose_name="รหัสประเภทพัสดุ",null=True, blank=True)
    des_id = models.CharField(max_length=100, verbose_name="รหัสรายละเอียดพัสดุ",null=True, blank=True)
    des_name = models.TextField(verbose_name="ชื่อรายละเอียดพัสดุ",null=True, blank=True)
    gpsc_id = models.CharField(max_length=100, verbose_name="รหัสพัสดุตาม กพร.",null=True, blank=True)
    keyword = models.TextField(verbose_name="คำค้นหา",null=True, blank=True)
    class Meta:
        verbose_name = "บันทึกรายการพัสดุ"
        verbose_name_plural = "บันทึกรายการพัสดุทั้งหมด"

    def __str__(self):
        return f"{self.class_id} - {self.keyword}"
