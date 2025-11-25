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
from src.master.models import dept

with open("./data/dept.json", encoding="utf-8") as f:
    data = json.load(f)

#  { "dept_id": "11001", "dept_name": "งานบริหารงานทั่วไป" },
for item in data:
    dept.objects.update_or_create(
        dept_id=item["dept_id"],
        defaults={"dept_name": item["dept_name"]}
    )