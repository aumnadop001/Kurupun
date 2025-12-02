import json
import os
import sys
import django

# ตั้งค่าให้ Python หา src ได้
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

# ตั้งค่า Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "main.settings")
django.setup()

import json,sys
from src.master.models import InventoryRecord, pClass, ptype, gpscode

with open("./data/description.json", encoding="utf-8") as f:
    data = json.load(f)

total = len(data)
success = 0
skipped = 0
errors = 0
not_found_class = 0
not_found_type = 0

print(f"Total records to import: {total}", file=sys.stderr)

for idx, item in enumerate(data, 1):
    try:
        # จัดการ des_id - อนุญาตให้ว่างได้
        des_id = item.get("Des_id", "").strip() if item.get("Des_id") else None
        if des_id == "":
            des_id = None
        
        # จัดการ class_id - ถ้าว่างให้เป็น None
        cls = None
        class_id_value = item.get("class_id", "").strip() if item.get("class_id") else ""
        if class_id_value:
            cls = pClass.objects.filter(class_id=class_id_value).first()
            if not cls:
                not_found_class += 1
                if not_found_class <= 10:  # แสดงแค่ 10 รายการแรก
                    print(f"[{idx}/{total}] Warning: class_id '{class_id_value}' not found in database", file=sys.stderr)
        
        # จัดการ type_id - ถ้าว่างให้เป็น None
        typ = None
        type_id_value = item.get("type_id", "").strip() if item.get("type_id") else ""
        if type_id_value:
            typ = ptype.objects.filter(ptype_id=type_id_value).first()
            if not typ:
                not_found_type += 1
                if not_found_type <= 10:  # แสดงแค่ 10 รายการแรก
                    print(f"[{idx}/{total}] Warning: type_id '{type_id_value}' not found in database", file=sys.stderr)
        
        # จัดการ gpsc_id - อนุญาตให้ว่างได้
        gps = None
        gpsc_id_value = item.get("gpsc_id", "").strip() if item.get("gpsc_id") else ""
        if gpsc_id_value:
            gps = gpscode.objects.filter(gpsc_id=gpsc_id_value).first()
        
        item_id = ''
        class_id_raw = item.get("class_id", "").strip() if item.get("class_id") else ""
        type_id_raw  = item.get("type_id", "").strip() if item.get("type_id") else ""
        des_id_raw   = item.get("Des_id", "").strip() if item.get("Des_id") else ""
        if class_id_raw or type_id_raw or des_id_raw:
            item_id = f"{class_id_raw}-{type_id_raw}-{des_id_raw}"
        else:
            item_id = None
        # Insert ทุก record (ไม่ใช้ update_or_create เพราะ des_id ซ้ำกันได้)
        InventoryRecord.objects.create(
            item_id=item_id,
            des_id=des_id,
            class_id=cls,
            type_id=typ,
            des_name=item.get("Des_name", "").strip() if item.get("Des_name") else None,
            gpsc_id=gps,
            keyword=item.get("keyword", "").strip() if item.get("keyword") else None,
        )
        success += 1
        
        if success % 500 == 0:
            print(f"[{idx}/{total}] Progress: {success} imported, {skipped} skipped, {errors} errors", file=sys.stderr)
            
    except Exception as e:
        errors += 1
        print(f"[{idx}/{total}] Error: {str(e)} (Des_id: {item.get('Des_id', 'N/A')})", file=sys.stderr)
        if errors >= 10:  # ถ้า error เกิน 10 ครั้งให้หยุด
            print(f"Too many errors, stopping import", file=sys.stderr)
            break

print(f"\n=== Import Summary ===", file=sys.stderr)
print(f"Total records: {total}", file=sys.stderr)
print(f"Successfully imported: {success}", file=sys.stderr)
print(f"Skipped: {skipped}", file=sys.stderr)
print(f"Errors: {errors}", file=sys.stderr)
print(f"class_id not found: {not_found_class}", file=sys.stderr)
print(f"type_id not found: {not_found_type}", file=sys.stderr)