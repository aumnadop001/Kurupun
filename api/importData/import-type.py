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

import json
from src.master.models import ptype, pClass

with open("./data/ptype.json", encoding="utf-8") as f:
    data = json.load(f)

for item in data:
    cls = pClass.objects.filter(class_id=item["class_id"]).first()

    ptype.objects.update_or_create(
        ptype_id=item["type_id"],
        defaults={"ptype_name": item["type_name"], "class_id": cls},
    )
