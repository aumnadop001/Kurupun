# File Structure Guide

## โครงสร้างไฟล์ใหม่หลังจากแยก app.py

```
Kurupun/
├── app_new.py                 # Main application file (ไฟล์หลัก)
├── app.py                     # Original file (เก็บไว้เป็น backup)
├── modules/
│   └── login.py              # Authentication functions
├── utils/                     # Utility functions
│   ├── __init__.py
│   ├── helpers.py            # Generic CRUD functions
│   └── config.py             # Field configurations
├── routes/                    # Blueprint routes (แยกตามหน้า)
│   ├── __init__.py
│   ├── main.py               # หน้าแรก
│   ├── auth.py               # Login/Register/Logout
│   ├── withdrawal.py         # ทะเบียนใบเบิกเอกสาร
│   ├── inventory_control.py  # คุมพัสดุ
│   ├── asset_control.py      # คุมครุภัณฑ์
│   ├── asset_distribute.py   # จ่ายครุภัณฑ์
│   └── fixed_asset.py        # ทรัพย์สินถาวร
├── templates/                 # HTML templates
├── static/                    # CSS, JS files
└── requirements.txt
```

## วิธีใช้งาน

### 1. เปลี่ยนจาก app.py เป็น app_new.py
```bash
# ชื่อไฟล์เดิม
python app.py

# ชื่อไฟล์ใหม่
python app_new.py
```

### 2. การทำงานของแต่ละไฟล์

#### `app_new.py` - Main Application
- สร้าง Flask app
- Register blueprints ทั้งหมด
- ตั้งค่า context processor
- จุดเริ่มต้นของแอป

#### `utils/helpers.py` - Generic Functions
- ฟังก์ชัน CRUD ที่ใช้ร่วมกัน
- ฟังก์ชัน API ที่ใช้ร่วมกัน
- `login_required` decorator
- Database connection

#### `utils/config.py` - Field Configurations
- กำหนด field mappings สำหรับทุก module
- ง่ายต่อการแก้ไขและเพิ่มเติม

#### `routes/*.py` - Blueprint Routes
แต่ละไฟล์จัดการ:
- Web routes (HTML templates)
- API routes (JSON responses)
- CRUD operations สำหรับ module นั้น ๆ

## ข้อดีของการแยกไฟล์

### 1. **จัดการง่าย**
- แต่ละ module อยู่ไฟล์แยก
- หาโค้ดได้เร็ว
- แก้ไขไม่กระทบส่วนอื่น

### 2. **ขยายง่าย**
- เพิ่ม module ใหม่แค่สร้างไฟล์ใน routes/
- Copy pattern จาก module ที่มีอยู่
- Register blueprint ใน app_new.py

### 3. **ทำงานร่วมกันได้**
- แต่ละคนรับผิดชอบไฟล์ต่างกัน
- ลด conflict ใน Git
- แยก responsibility ชัดเจน

### 4. **ทดสอบง่าย**
- Test แต่ละ module แยกกัน
- Mock dependencies ได้ง่าย
- Debug ได้เฉพาะส่วน

## การเพิ่ม Module ใหม่

### 1. สร้างไฟล์ route ใหม่
```python
# routes/new_module.py
from flask import Blueprint
from utils.helpers import login_required, generic_list_view
from utils.config import NEW_MODULE_FIELDS

new_module_bp = Blueprint('new_module', __name__, url_prefix='/new_module')

@new_module_bp.route("/")
@login_required
def list():
    return generic_list_view(
        collection_name="new_collection",
        template_path="new_module/list.html",
        search_field="name",
        sort_field="date",
        sort_order=-1,
        date_fields=["date"],
    )
```

### 2. เพิ่ม field configuration
```python
# utils/config.py
NEW_MODULE_FIELDS = {
    "name": "name",
    "date": "date",
    "description": "description"
}
```

### 3. Register blueprint
```python
# app_new.py
from routes.new_module import new_module_bp

app.register_blueprint(new_module_bp)
```

## URL Mapping

### เดิม (app.py)
```
/withdrawal
/withdrawal/add
/withdrawal/edit/<id>
/api/withdrawal
```

### ใหม่ (app_new.py)
```
/withdrawal/          # withdrawal_bp.list
/withdrawal/add       # withdrawal_bp.add
/withdrawal/edit/<id> # withdrawal_bp.edit
/withdrawal/api       # withdrawal_bp.api_list
```

## Migration Steps

### 1. ทดสอบ app_new.py
```bash
python app_new.py
```

### 2. ตรวจสอบ routes ทั้งหมด
- เช็คว่าทุกหน้าทำงานได้
- ทดสอบ CRUD operations
- ทดสอบ API endpoints

### 3. อัปเดต templates (ถ้าจำเป็น)
```html
<!-- เปลี่ยน url_for -->
<!-- เดิม -->
<a href="{{ url_for('withdrawal') }}">

<!-- ใหม่ -->
<a href="{{ url_for('withdrawal.list') }}">
```

### 4. อัปเดต production deployment
- เปลี่ยนจาก app.py เป็น app_new.py
- อัปเดต wsgi configuration

## Troubleshooting

### ปัญหาที่อาจพบ:

1. **ImportError**: ตรวจสอบ __init__.py ในทุก directory
2. **Blueprint not found**: ตรวจสอบการ register blueprint
3. **Template not found**: ตรวจสอบ template_path ใน generic functions
4. **url_for error**: อัปเดต template ให้ใช้ blueprint name

### วิธีแก้:

1. **เช็ค imports**
```python
# ถ้า import error
import sys
sys.path.append('.')
```

2. **เช็ค blueprint registration**
```python
# ใน app_new.py
print(app.url_map)  # ดู routes ทั้งหมด
```

3. **เช็ค working directory**
```bash
pwd  # ตรวจสอบว่าอยู่ใน Kurupun directory
```

## Best Practices

1. **ใช้ relative imports**
2. **ตั้งชื่อ function ให้สื่อความหมาย**
3. **เก็บ configuration แยกไฟล์**
4. **ใช้ Blueprint prefix เพื่อหลีกเลี่ยง conflict**
5. **เขียน docstring สำหรับ function ที่ซับซ้อน**

## Performance Benefits

1. **Lazy loading** - โหลดเฉพาะ module ที่ใช้
2. **Better caching** - แยก import แยก cache
3. **Faster development** - restart เฉพาะส่วนที่แก้
4. **Memory efficiency** - ไม่โหลดโค้ดที่ไม่ใช้