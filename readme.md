# การติดตั้งและรันโปรเจกต์

ขั้นตอนการติดตั้งและรันโปรเจกต์นี้มีดังนี้:

## 1. ใช้งาน env

- Mac

```bash
source env/bin/activate
```

- Windows

```bash
env\Scripts\activate.bat
```

## 2. ติดตั้ง Dependencies

ติดตั้งแพ็กเกจที่จำเป็นโดยใช้ไฟล์ `requirements.txt`:

```bash
pip install -r requirements.txt
```

## 3. รันฐานข้อมูล MongoDB ด้วย Docker

```bash
docker-compose -f ./database/mongo.db.yml up --build -d
```

## 4. รันแอปพลิเคชัน

```bash
python app.py
```
