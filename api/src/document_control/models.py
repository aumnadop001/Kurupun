from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from src.master.models import Description


class Item(models.Model):
    """
    ข้อมูลพัสดุหลัก - Master Item
    เชื่อมโยงกับ Description จาก master app
    """

    description = models.ForeignKey(
        Description,
        on_delete=models.CASCADE,
        related_name="stock_items",
        verbose_name="รายละเอียดพัสดุ",
    )
    unit = models.CharField(max_length=50, default="", verbose_name="หน่วยนับ")
    storage_location = models.CharField(max_length=255, verbose_name="ที่เก็บ")

    # เกณฑ์การสั่ง
    order_criteria_day = models.IntegerField(
        default=0, validators=[MinValueValidator(0)], verbose_name="เกณฑ์สั่ง (วัน)"
    )
    order_criteria_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(Decimal("0"))],
        verbose_name="เกณฑ์สั่ง (จำนวน)",
    )

    # จุดสั่งเพิ่มเติม
    additional_order_point_day = models.IntegerField(
        default=0, validators=[MinValueValidator(0)], verbose_name="จุดสั่งเพิ่มเติม (วัน)"
    )
    additional_order_point_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(Decimal("0"))],
        verbose_name="จุดสั่งเพิ่มเติม (จำนวน)",
    )

    # เกณฑ์ปลอดภัย
    safety_criteria_day = models.IntegerField(
        default=0, validators=[MinValueValidator(0)], verbose_name="เกณฑ์ปลอดภัย (วัน)"
    )
    safety_criteria_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(Decimal("0"))],
        verbose_name="เกณฑ์ปลอดภัย (จำนวน)",
    )

    # รับค้าง
    pending_received_1 = models.CharField(max_length=100, blank=True, null=True, verbose_name="รับค้าง 1")
    pending_received_2 = models.CharField(max_length=100, blank=True, null=True, verbose_name="รับค้าง 2")
    pending_received_3 = models.CharField(max_length=100, blank=True, null=True, verbose_name="รับค้าง 3")
    pending_received_4 = models.CharField(max_length=100, blank=True, null=True, verbose_name="รับค้าง 4")

    # ข้อมูลเพิ่มเติม
    notes = models.TextField(blank=True, null=True, verbose_name="หมายเหตุ")
    is_active = models.BooleanField(default=True, verbose_name="สถานะใช้งาน")

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="วันที่สร้าง")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="วันที่แก้ไข")

    class Meta:
        db_table = "item"
        verbose_name = "พัสดุ"
        verbose_name_plural = "พัสดุทั้งหมด"
        ordering = ["description"]

    def __str__(self):
        return f"{self.get_item_id} - {self.description.Des_name}"

    @property
    def get_item_id(self):
        """
        ดึง item_id จาก Description (format: {class_id}-{type_id}-{Des_id})
        """
        return self.description.get_item_id()

    @property
    def name(self):
        """รายการพัสดุ"""
        return self.description.Des_name


class AlternativeItem(models.Model):
    """
    หมายเลขพัสดุแทนกันได้
    """

    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name="alternatives",
        verbose_name="พัสดุหลัก",
    )
    alternative_item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name="alternative_for",
        verbose_name="พัสดุแทน",
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="วันที่สร้าง")

    class Meta:
        db_table = "alternative_item"
        verbose_name = "พัสดุแทนกันได้"
        verbose_name_plural = "พัสดุแทนกันได้ทั้งหมด"
        unique_together = ["item", "alternative_item"]

    def __str__(self):
        return f"{self.item.get_item_id} <-> {self.alternative_item.get_item_id}"


class RelatedEquipment(models.Model):
    """
    ครุภัณฑ์ที่เกี่ยวข้อง
    """

    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name="related_equipments",
        verbose_name="พัสดุ",
    )
    equipment_name = models.CharField(max_length=255, verbose_name="ชื่อครุภัณฑ์")
    equipment_code = models.CharField(
        max_length=100, blank=True, null=True, verbose_name="รหัสครุภัณฑ์"
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="วันที่สร้าง")

    class Meta:
        db_table = "related_equipment"
        verbose_name = "ครุภัณฑ์ที่เกี่ยวข้อง"
        verbose_name_plural = "ครุภัณฑ์ที่เกี่ยวข้องทั้งหมด"

    def __str__(self):
        return f"{self.item.get_item_id} - {self.equipment_name}"


class PendingTransaction(models.Model):
    """
    ค้างรับ และ ค้างจ่าย
    """

    TRANSACTION_TYPE_CHOICES = [
        ("receive", "ค้างรับ"),
        ("issue", "ค้างจ่าย"),
    ]

    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name="pending_transactions",
        verbose_name="พัสดุ",
    )
    transaction_type = models.CharField(
        max_length=10, choices=TRANSACTION_TYPE_CHOICES, verbose_name="ประเภท"
    )
    date = models.DateField(verbose_name="วันที่")
    document_no = models.CharField(max_length=100, verbose_name="หลักฐาน")
    unit = models.CharField(max_length=50, verbose_name="หน่วย")
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0"))],
        verbose_name="จำนวน",
    )

    is_resolved = models.BooleanField(default=False, verbose_name="จัดการแล้ว")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="วันที่สร้าง")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="วันที่แก้ไข")

    class Meta:
        db_table = "pending_transaction"
        verbose_name = "รายการค้าง"
        verbose_name_plural = "รายการค้างทั้งหมด"
        ordering = ["-date", "item"]

    def __str__(self):
        return f"{self.get_transaction_type_display()} - {self.item.get_item_id} - {self.quantity}"


class StockTransaction(models.Model):
    """
    รายการรับ-จ่าย พัสดุ (บันทึกการเคลื่อนไหว)
    """

    item = models.ForeignKey(
        Item, on_delete=models.CASCADE, related_name="transactions", verbose_name="พัสดุ"
    )
    date = models.DateField(verbose_name="วันที่")

    # การรับ
    receive_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(Decimal("0"))],
        verbose_name="รับ",
    )
    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(Decimal("0"))],
        verbose_name="ราคาต่อหน่วย",
    )
    receive_document_no = models.CharField(
        max_length=100, blank=True, null=True, verbose_name="หลักฐานรับ"
    )

    # ความต้องการ
    initial_demand = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(Decimal("0"))],
        verbose_name="ความต้องการขั้นต้น",
    )
    replacement_demand = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(Decimal("0"))],
        verbose_name="ความต้องการทดแทน",
    )

    # การจ่าย
    issue_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(Decimal("0"))],
        verbose_name="จ่าย",
    )
    total_borrowed = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(Decimal("0"))],
        verbose_name="รวมยืม",
    )

    # คงคลัง
    stock_balance = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, verbose_name="คงคลัง"
    )

    # ผู้รับผิดชอบ
    signature = models.CharField(
        max_length=255, blank=True, null=True, verbose_name="ลายมือชื่อ/ผู้รับผิดชอบ"
    )

    notes = models.TextField(blank=True, null=True, verbose_name="หมายเหตุ")
    created_by = models.CharField(
        max_length=100, blank=True, null=True, verbose_name="ผู้บันทึก"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="วันที่สร้าง")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="วันที่แก้ไข")

    class Meta:
        db_table = "stock_transaction"
        verbose_name = "รายการรับ-จ่าย"
        verbose_name_plural = "รายการรับ-จ่ายทั้งหมด"
        ordering = ["-date", "item"]

    def __str__(self):
        return f"{self.item.get_item_id} - {self.date} - คงคลัง: {self.stock_balance}"

    def save(self, *args, **kwargs):
        """
        คำนวณคงคลังอัตโนมัติ
        """
        # หาคงคลังล่าสุดก่อนหน้า
        previous_transaction = (
            StockTransaction.objects.filter(item=self.item, date__lt=self.date)
            .order_by("-date", "-created_at")
            .first()
        )

        previous_balance = (
            previous_transaction.stock_balance if previous_transaction else 0
        )

        # คำนวณคงคลังใหม่
        self.stock_balance = (
            previous_balance + self.receive_quantity - self.issue_quantity
        )

        super().save(*args, **kwargs)
