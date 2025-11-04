"""
===========================================
📋 CRUD TEMPLATE - Copy & Paste ได้เลย!
===========================================

วิธีใช้: Copy block ด้านล่างไปวางใน app.py แล้วแก้ชื่อให้ตรงกับ collection ของคุณ

ตัวอย่างที่ 1: ทะเบียนคุมใบเบิก (Withdrawal)
"""

# ====================== COPY จากตรงนี้ ======================
crud_builder.register(
    route_name="withdrawal",  # ชื่อ route (URL)
    collection_name="requisition_register",  # ชื่อ collection ใน MongoDB
    id_field="registerNo",  # field ที่ใช้เป็น ID
    template_folder="withdrawal",  # โฟลเดอร์ template
    date_fields=["registerDate", "filedDate"],  # field วันที่ทั้งหมด
    form_fields=[  # field ทั้งหมดในฟอร์ม
        "registerNo",
        "registerDate",
        "documentName",
        "senderReceiver",
        "firstItem",
        "filedDate",
        "relatedDocumentNo",
    ],
    search_field="documentName",  # field ที่ใช้ค้นหา
    sequence_field="sequenceNo",  # field auto increment (ถ้ามี)
    sort_field="sequenceNo",  # field ที่ใช้เรียงลำดับ
    sort_order=1,  # 1=น้อย→มาก, -1=มาก→น้อย
)
# ====================== COPY จบ ======================


"""
ตัวอย่างที่ 2: บัญชีคุมพัสดุ (Inventory Control)
"""

# ====================== COPY จากตรงนี้ ======================
crud_builder.register(
    route_name="inventory_control",
    collection_name="inventory_control",
    id_field="itemId",
    template_folder="inventory_control",
    date_fields=["date"],
    form_fields=[
        "date",
        "evidence",
        "itemName",
        "itemNumber",
        "unit",
        "rate",
        "acquisitionMethod",
        "budgetType",
        "pricePerUnit",
        "receiveQuantity",
        "primaryNeed",
        "replacementNeed",
        "distributeQuantity",
        "remainingStock",
        "signature",
    ],
    search_field="itemName",
    sequence_field="itemId",
    sort_field="date",
    sort_order=-1,
    display_date_format="%d/%m/%Y",  # format แสดงผล (ถ้าต่างจาก %Y-%m-%d)
)
# ====================== COPY จบ ======================


"""
ตัวอย่างที่ 3: บัญชีคุมครุภัณฑ์ (Asset Control)
"""

# ====================== COPY จากตรงนี้ ======================
crud_builder.register(
    route_name="asset_control",
    collection_name="asset_control",
    id_field="registerNo",
    template_folder="asset_control",
    date_fields=["registerDate", "filedDate"],
    form_fields=[
        "registerNo",
        "registerDate",
        "assetName",
        "assetUnit",
        "quantity",
        "filedDate",
        "relatedDocumentNo",
    ],
    search_field="assetName",
    sequence_field="sequenceNo",
    sort_field="sequenceNo",
    sort_order=1,
)
# ====================== COPY จบ ======================


"""
ตัวอย่างที่ 4: บัญชีคุมครุภัณฑ์จ่าย (Asset Distribute)
"""

# ====================== COPY จากตรงนี้ ======================
crud_builder.register(
    route_name="asset_distribute",
    collection_name="asset_distribute",
    id_field="registerNo",
    template_folder="asset_distribute",
    date_fields=["registerDate", "distributeDate"],
    form_fields=[
        "registerNo",
        "registerDate",
        "assetName",
        "assetNumber",
        "receivingUnit",
        "receiveEvidence",
        "distributeEvidence",
        "quantity",
        "distributeDate",
    ],
    search_field="assetName",
    sequence_field="sequenceNo",
    sort_field="sequenceNo",
    sort_order=1,
)
# ====================== COPY จบ ======================


"""
==========================================
🎯 Parameters ที่ต้องแก้
==========================================

✅ route_name           → ชื่อ URL (เช่น 'product', 'customer')
✅ collection_name      → ชื่อ collection ใน MongoDB
✅ id_field             → field ที่เป็น Primary Key
✅ template_folder      → ชื่อโฟลเดอร์ใน templates/
✅ date_fields          → list ของ field วันที่
✅ form_fields          → list ของ field ทั้งหมดในฟอร์ม
✅ search_field         → field ที่ใช้ค้นหา (ถ้าไม่มีใส่ None)
✅ sequence_field       → field auto increment (ถ้าไม่มีใส่ None)
✅ sort_field           → field ที่ใช้เรียง (default: '_id')
✅ sort_order           → 1 (น้อย→มาก) หรือ -1 (มาก→น้อย)
✅ display_date_format  → format แสดงวันที่ (default: '%Y-%m-%d')


==========================================
📁 โครงสร้าง Template ที่ต้องมี
==========================================

templates/
  └── [template_folder]/
      ├── list.html    ← หน้าแสดงรายการ
      └── form.html    ← หน้าฟอร์ม add/edit


==========================================
🚀 Routes ที่สร้างให้อัตโนมัติ
==========================================

GET  /[route_name]                  → หน้าแสดงรายการ
GET  /[route_name]/add              → หน้าเพิ่มข้อมูล
POST /[route_name]/add              → บันทึกข้อมูลใหม่
GET  /[route_name]/edit/<id>        → หน้าแก้ไขข้อมูล
POST /[route_name]/edit/<id>        → อัปเดตข้อมูล
POST /[route_name]/delete/<id>      → ลบข้อมูล


==========================================
💡 Tips
==========================================

1. ใส่เฉพาะ field ที่อยู่ในฟอร์มใน form_fields
2. field วันที่จะแปลงเป็น datetime อัตโนมัติ
3. ตัวเลขจะแปลงเป็น int/float อัตโนมัติ
4. sequence_field จะ auto increment อัตโนมัติ
5. search_field รองรับ case-insensitive search
"""
