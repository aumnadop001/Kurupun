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
from src.master.models import invoiceType

with open("./data/invoicetype.json", encoding="utf-8") as f:
    data = json.load(f)

for item in data:
    invoiceType.objects.update_or_create(
        invioc_type=item["invioc_type"],
        defaults={"invioc_name": item["invioc_name"]}
    )