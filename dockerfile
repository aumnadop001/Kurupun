# ใช้ base image จาก Python
FROM python:3.11-slim

# ตั้ง working directory
WORKDIR /app

# copy ไฟล์ requirements
COPY requirements.txt .

# ติดตั้ง pip และ dependencies จาก requirements.txt
RUN pip install --upgrade pip -i https://pypi.org/simple
RUN pip install --no-cache-dir -r requirements.txt -i https://pypi.org/simple --timeout 120



# ติดตั้ง dependencies
# RUN pip install --no-cache-dir -r requirements.txt

# copy source code
COPY . .

# expose port
EXPOSE 5000

# คำสั่งรัน Flask
CMD ["python", "app.py"]