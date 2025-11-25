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
from src.master.models import gpscode

with open("./data/gpsc.json", encoding="utf-8") as f:
    data = json.load(f)

for item in data:
    gpscode.objects.update_or_create(
        gpsc_id=item["gpsc_id"],
        defaults={"gpsc_name": item["gpsc_name"]}
    )