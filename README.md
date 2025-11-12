# Project Setup

## Creating Python Virtual Environment

### Windows

```bash
# สร้าง virtual environment
python -m venv env

# เปิดใช้งาน virtual environment
env\Scripts\activate
```

### macOS/Linux

```bash
# สร้าง virtual environment
python3 -m venv env

# เปิดใช้งาน virtual environment
source env/bin/activate
```

## Installing Dependencies

```bash
# หลังจากเปิดใช้งาน virtual environment แล้ว
pip install -r requirements.txt
```

## Deactivating Virtual Environment

```bash
deactivate
```

## Starting Database

```bash
# เข้าไปยัง directory ของ database
cd database

# รัน Docker Compose เพื่อ start database
docker-compose up --build -d
```

## Start App

```bash
cd web

# รัน Docker Compose เพื่อ start web
docker-compose up --build -d
```
