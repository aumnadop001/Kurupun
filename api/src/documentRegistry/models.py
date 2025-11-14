from django.db import models


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
        verbose_name = "ทะเบียนเอกสาร"
        verbose_name_plural = "ทะเบียนเอกสารทั้งหมด"
        ordering = ["-registration_date"]

    def __str__(self):
        return f"Registry {self.registry_number}: {self.document_title}"


class InventoryRecord(models.Model):
    # เชื่อม ForeignKey -> หนึ่ง DocumentRegistry มีหลาย InventoryRecord
    document_registry = models.ForeignKey(DocumentRegistry,on_delete=models.CASCADE,related_name="inventories",verbose_name="ทะเบียนเอกสาร",)
    # --------------------------------
    # เกณฑ์การสั่ง
    # --------------------------------
    order_criteria = models.CharField(max_length=255, blank=True, null=True)  # เกณฑ์สั่ง
    reorder_point = models.CharField(max_length=255, blank=True, null=True)  # จุดสั่งเพิ่มเติม
    safety_stock = models.CharField(max_length=255, blank=True, null=True)  # เกณฑ์ปลอดภัย

    related_equipment = models.TextField(blank=True, null=True)  # ครุภัณฑ์ที่เกี่ยวข้อง
    remark = models.TextField(blank=True, null=True)  # หมายเหตุ

    # --------------------------------
    # ค้างรับ และ ค้างจ่าย (ซ้าย)
    # --------------------------------
    doc_date_left = models.DateField(blank=True, null=True)  # ว.ด.ป.
    evidence_left = models.CharField(max_length=255, blank=True, null=True)  # หลักฐาน
    unit_left = models.CharField(max_length=50, blank=True, null=True)  # หน่วย
    qty_left = models.IntegerField(blank=True, null=True)  # จำนวน

    pending_receive_1 = models.IntegerField(blank=True, null=True)
    pending_receive_2 = models.IntegerField(blank=True, null=True)
    pending_receive_3 = models.IntegerField(blank=True, null=True)
    pending_receive_4 = models.IntegerField(blank=True, null=True)

    # --------------------------------
    # ความต้องการรับและจ่าย (ขวา)
    # --------------------------------
    doc_date_right = models.DateField(blank=True, null=True)  # ว.ด.ป.
    received_qty = models.IntegerField(blank=True, null=True)  # รับ
    price_per_unit = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)  # ราคาต่อหน่วย
    evidence_right = models.CharField(max_length=255, blank=True, null=True)  # หลักฐาน

    demand_initial = models.IntegerField(blank=True, null=True)  # ความต้องการขั้นต้น
    demand_replace = models.IntegerField(blank=True, null=True)  # ความต้องการทดแทน

    issued_qty = models.IntegerField(blank=True, null=True)  # จ่าย
    total_borrowed = models.IntegerField(blank=True, null=True)  # รวมยืม
    stock_balance = models.IntegerField(blank=True, null=True)  # คงคลัง

    signature = models.CharField(max_length=255, blank=True, null=True)  # ลายมือชื่อ

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "บันทึกรายการพัสดุ"
        verbose_name_plural = "บันทึกรายการพัสดุทั้งหมด"

    def __str__(self):
        return f"Inventory Record #{self.id} ({self.document_registry.registry_number})"
