from django.db import models


class DocumentRegister(models.Model):
	reg_no = models.CharField("ทะเบียนที่", max_length=100, blank=True, null=True)
	reg_date = models.DateField("วันที่ลงทะเบียน", blank=True, null=True)
	filed_date = models.DateField("วันที่เก็บเข้าแฟ้ม", blank=True, null=True)
	related_doc_no = models.CharField("เลขที่เอกสารที่เกี่ยวข้อง", max_length=200, blank=True, null=True)
	withdrawal_set_no = models.CharField("เลขที่ชุดเบิก", max_length=200, blank=True, null=True)
	notes = models.TextField("หมายเหตุ", blank=True)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name = "ทะเบียนเอกสาร"
		verbose_name_plural = "ทะเบียนเอกสาร"
		ordering = ["-reg_date", "reg_no"]

	def __str__(self):
		return f"{self.reg_no or "(ไม่มีทะเบียน)"} - {self.reg_date or "(ไม่มีวันที่)"}"


class DocumentEntry(models.Model):
	register = models.ForeignKey(DocumentRegister, related_name="entries", on_delete=models.CASCADE)
	title = models.CharField("หัวข้อ/ชื่อเอกสาร", max_length=255)
	order = models.PositiveIntegerField("ลำดับ", default=0)
	content = models.TextField("เนื้อหา/คำอธิบาย", blank=True)
	attached_file = models.FileField("ไฟล์แนบ", upload_to="documents/%Y/%m/%d", blank=True, null=True)

	class Meta:
		verbose_name = "รายการเอกสาร"
		verbose_name_plural = "รายการเอกสาร"
		ordering = ["order", "id"]

	def __str__(self):
		return f"{self.title} ({self.register.reg_no or 'no-reg'})"

