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

from src.master.models import pClass, ptype, gpscode, Description

with open("./data/description.json", encoding="utf-8") as f:
    data = json.load(f)

total = len(data)
success = 0
skipped = 0
errors = 0
not_found_class = 0
not_found_type = 0
not_found_gpsc = 0

print(f"Total records to import: {total}", file=sys.stderr)

for idx, item in enumerate(data, 1):
    try:
        # ตรวจสอบ field ที่จำเป็น
        class_id_value = item.get("class_id", "").strip() if item.get("class_id") else ""
        type_id_value = item.get("type_id", "").strip() if item.get("type_id") else ""
        des_id_value = item.get("Des_id", "").strip() if item.get("Des_id") else ""
        
        # ข้ามถ้าข้อมูลหลักไม่ครบ
        if not class_id_value or not type_id_value or not des_id_value:
            skipped += 1
            if skipped <= 10:
                print(f"[{idx}/{total}] Skipped: Missing required fields (class_id={class_id_value}, type_id={type_id_value}, des_id={des_id_value})", file=sys.stderr)
            continue
        
        # หา pClass
        cls = pClass.objects.filter(class_id=class_id_value).first()
        if not cls:
            not_found_class += 1
            if not_found_class <= 10:
                print(f"[{idx}/{total}] Error: class_id '{class_id_value}' not found", file=sys.stderr)
            errors += 1
            continue
        
        # หา ptype
        typ = ptype.objects.filter(ptype_id=type_id_value).first()
        if not typ:
            not_found_type += 1
            if not_found_type <= 10:
                print(f"[{idx}/{total}] Error: type_id '{type_id_value}' not found", file=sys.stderr)
            errors += 1
            continue
        
        # หา gpscode (optional)
        gpsc = None
        gpsc_id_value = item.get("gpsc_id", "").strip() if item.get("gpsc_id") else ""
        if gpsc_id_value:
            gpsc = gpscode.objects.filter(gpsc_id=gpsc_id_value).first()
            if not gpsc:
                not_found_gpsc += 1
                if not_found_gpsc <= 10:
                    print(f"[{idx}/{total}] Warning: gpsc_id '{gpsc_id_value}' not found", file=sys.stderr)
        
        # สร้างหรืออัปเดต Description
        description, created = Description.objects.update_or_create(
            class_id=cls,
            type_id=typ,
            Des_id=des_id_value,
            defaults={
                'Des_name': item.get("Des_name", "").strip() if item.get("Des_name") else "",
                'gpsc_id': gpsc,
                'keyword': item.get("keyword", "").strip() if item.get("keyword") else "",
            }
        )
        
        success += 1
        if success % 1000 == 0:
            print(f"[{idx}/{total}] Progress: {success} records imported", file=sys.stderr)
        
    except Exception as e:
        errors += 1
        if errors <= 10:
            print(f"[{idx}/{total}] Exception: {str(e)}", file=sys.stderr)

print("\n" + "="*60, file=sys.stderr)
print(f"Import Summary:", file=sys.stderr)
print(f"  Total: {total}", file=sys.stderr)
print(f"  Success: {success}", file=sys.stderr)
print(f"  Skipped: {skipped}", file=sys.stderr)
print(f"  Errors: {errors}", file=sys.stderr)
print(f"  Class not found: {not_found_class}", file=sys.stderr)
print(f"  Type not found: {not_found_type}", file=sys.stderr)
print(f"  GPSC not found (warnings): {not_found_gpsc}", file=sys.stderr)
print("="*60, file=sys.stderr)