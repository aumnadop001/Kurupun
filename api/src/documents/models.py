from django.db import models

# Create your models here.


class DocumentRecord(models.Model):
    registerNo = models.CharField(max_length=100, null=True,blank=True)  # ทะเบียนที่
    registration_number = models.CharField(max_length=100, unique=True) # ทะเบียนที่
    registration_date = models.DateField() # วันที่ลงทะเบียน
    document_type = models.CharField(max_length=100) # ประเภทเอกสาร
    sender = models.CharField(max_length=255) # จาก
    recipient = models.CharField(max_length=255) # ถึง
    first_item = models.CharField(max_length=255) # รายการแรก
    inventory_number = models.CharField(max_length=100, blank=True, null=True) # หมายเลขพัสดุ
    unit_of_measure = models.CharField(max_length=50) # หน่วยนับ
    file_storage_date = models.DateField() # วันที่เก็บเข้าแฟ้ม
    related_document_number = models.CharField(max_length=100, blank=True, null=True) # เลขที่เอกสารที่เกียวข้อง
    remark = models.TextField(blank=True, null=True)  # หมายเหตุ
    related_equipment = models.JSONField(blank=True, null=True) # ครุภัณฑ์ที่เกี่ยวข้อง
    inventory_alternate_numbers = models.JSONField(blank=True, null=True) # หมายเลขพัสดุแทนกันได้
    days_to_order = models.PositiveIntegerField(blank=True, null=True) # เกณฑ์สั่ง วัน
    quantity_to_order = models.PositiveIntegerField(blank=True, null=True) # เกณฑ์สั่ง จำนวน
    reorder_point_days = models.PositiveIntegerField(blank=True, null=True)  # จุดสั่งเพิ่มเติม วัน
    reorder_point_quantity = models.PositiveIntegerField(blank=True, null=True) # จุดสั่งเพิ่มเติม จำนวน
    safety_stock_days = models.PositiveIntegerField(blank=True, null=True)  # เกณฑ์ปลอดภัย วัน
    safety_stock_quantity = models.PositiveIntegerField(blank=True, null=True) # เกณฑ์ปลอดภัย จำนวน
    storage_location = models.CharField(max_length=255, blank=True, null=True) # ที่เก็บ
    def __str__(self):
        return f"DocumentRecord {self.registration_number}"

    class Meta:
        verbose_name = "ทะเบียนเอกสาร"
        verbose_name_plural = "ทะเบียนเอกสารทั้งหมด"


class Inventory(models.Model):
    document_record = models.ForeignKey(DocumentRecord, on_delete=models.CASCADE, related_name='inventories', null=True, blank=True)
    # ===== Zone ค้างรับ และ ค้างจ่าย =====
    pending_date = models.DateField(null=True, blank=True)  # ว.ด.ป
    pending_evidence = models.CharField(max_length=100, blank=True, default='')  # หลักฐาน
    pending_unit = models.CharField(max_length=50, blank=True, default='')  # หน่วยนับ
    pending_quantity = models.PositiveIntegerField(blank=True, null=True)  # จำนวน
    pending_receive1 = models.PositiveIntegerField(blank=True, null=True)  # รับ
    pending_balance1 = models.PositiveIntegerField(blank=True, null=True)  # ค้าง
    pending_receive2 = models.PositiveIntegerField(blank=True, null=True)  # รับ
    pending_balance2 = models.PositiveIntegerField(blank=True, null=True)  # ค้าง
    pending_receive3 = models.PositiveIntegerField(blank=True, null=True)  # รับ
    pending_balance3 = models.PositiveIntegerField(blank=True, null=True)  # ค้าง
    pending_receive4 = models.PositiveIntegerField(blank=True, null=True)  # รับ
    pending_balance4 = models.PositiveIntegerField(blank=True, null=True)  # ค้าง
    pending_signature = models.CharField(max_length=255, blank=True, default='')  # ลายมือชื่อ

    # ===== Zone ความต้องการรับและจ่าย =====
    request_date = models.DateField(null=True, blank=True)  # ว.ด.ป
    received_quantity = models.PositiveIntegerField(default=0)  # จำนวนที่รับ
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # ราคาต่อหน่วย
    request_evidence = models.CharField(max_length=100, blank=True, default='')  # หลักฐาน

    request_type = models.CharField(  # ขั้นต้น / ทดแทน
        max_length=20,
        choices=(
            ("INITIAL", "ขั้นต้น"),
            ("REPLACEMENT", "ทดแทน"),
        ),
        default="INITIAL",
    )

    issue_quantity = models.PositiveIntegerField(default=0)  # จ่าย
    total_borrowed = models.PositiveIntegerField(default=0)  # รวมยืม
    previous_stock_balance = models.PositiveIntegerField(default=0)  # คงคลังก่อนหน้า
    stock_balance = models.PositiveIntegerField(default=0)  # คงคลัง
    request_signature = models.CharField(max_length=255, blank=True, default='')  # ลายมือชื่อ

    class Meta:
        verbose_name = "ทะเบียนคุมวัสดุ"
        verbose_name_plural = "ทะเบียนคุมวัสดุทั้งหมด"
