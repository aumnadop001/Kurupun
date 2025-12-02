from django.db import models

# Create your models here.


class pClass(models.Model):
    class_id = models.CharField(max_length=100, null=False, blank=True)
    class_name = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.class_name
    class Meta:
        verbose_name = "หมวดพัสดุ"
        verbose_name_plural = "หมวดพัสดุทั้งหมด"

class gpscode(models.Model):
    gpsc_id = models.CharField(max_length=100, null=False, blank=True)
    gpsc_name = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.gpsc_name
    class Meta:
        verbose_name = "รหัสพัสดุตาม กพร."
        verbose_name_plural = "รหัสพัสดุตาม กพร. ทั้งหมด"

class ptype(models.Model):
    ptype_id = models.CharField(max_length=100, null=False, blank=True)
    ptype_name = models.TextField(blank=True, null=True)
    class_id = models.ForeignKey(pClass, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.ptype_name
    class Meta:
        verbose_name = "ประเภทพัสดุ"
        verbose_name_plural = "ประเภทพัสดุทั้งหมด"


class InventoryRecord(models.Model):
    item_id = models.CharField(max_length=100, verbose_name="รหัสรายการพัสดุ", null=True, blank=True)
    class_id = models.ForeignKey(pClass, on_delete=models.CASCADE, null=True, blank=True)
    type_id = models.ForeignKey(ptype, on_delete=models.CASCADE, null=True, blank=True)
    des_id = models.CharField(max_length=100, verbose_name="รหัสรายละเอียดพัสดุ", null=True, blank=True)
    des_name = models.TextField(verbose_name="ชื่อรายละเอียดพัสดุ", null=True, blank=True)
    gpsc_id = models.ForeignKey(gpscode, on_delete=models.CASCADE, null=True, blank=True)
    keyword = models.TextField(verbose_name="คำค้นหา", null=True, blank=True)

    class Meta:
        verbose_name = "บันทึกรายการพัสดุ"
        verbose_name_plural = "บันทึกรายการพัสดุทั้งหมด"

    def __str__(self):
        return f"{self.class_id} - {self.keyword}"

class dept(models.Model):
    dept_id = models.CharField(max_length=100, null=False, blank=True)
    dept_name = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.dept_name
    class Meta:
        verbose_name = "หน่วยงาน"
        verbose_name_plural = "หน่วยงานทั้งหมด"

class invoiceType(models.Model):
    invioc_type = models.CharField(max_length=100, null=False, blank=True)
    invioc_name = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.invioc_name
    class Meta:
        verbose_name = "ประเภทใบสั่งซื้อ"
        verbose_name_plural = "ประเภทใบสั่งซื้อทั้งหมด"