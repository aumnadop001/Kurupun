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

class Description(models.Model):
    """
    รายละเอียดพัสดุ (Description) - จาก description.json
    """
    class_id = models.ForeignKey(
        pClass,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="descriptions",
        verbose_name="หมวดพัสดุ",
    )
    type_id = models.ForeignKey(
        ptype,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="descriptions",
        verbose_name="ประเภทพัสดุ",
    )
    Des_id = models.CharField(
        max_length=100, null=True, blank=True, verbose_name="รหัสรายละเอียด"
    )
    Des_name = models.TextField(blank=True, null=True, verbose_name="ชื่อรายละเอียด")

    gpsc_id = models.ForeignKey(
        gpscode,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="descriptions",
        verbose_name="รหัสพัสดุตาม กพร.",
    )
    keyword = models.TextField(blank=True, null=True, verbose_name="คำค้นหา")

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="วันที่สร้าง")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="วันที่แก้ไข")

    def __str__(self):
        return f"{self.get_item_id()} - {self.Des_name}"

    def get_item_id(self):
        """
        สร้าง item_id แบบ {class_id}-{type_id}-{Des_id}
        """
        class_code = self.class_id.class_id if self.class_id else ""
        type_code = self.type_id.ptype_id if self.type_id else ""
        des_code = self.Des_id if self.Des_id else ""
        return f"{class_code}-{type_code}-{des_code}"

    class Meta:
        db_table = "description"
        verbose_name = "รายละเอียดพัสดุ"
        verbose_name_plural = "รายละเอียดพัสดุทั้งหมด"
        ordering = ["class_id", "type_id", "Des_id"]
