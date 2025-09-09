from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime
import os
load_dotenv()

# สร้าง connection สำหรับ login module
client = MongoClient(os.getenv('MONGO_URL', 'mongodb://localhost:27017/'))
db = client["kurupun"]

def authenticate_user(username, password):
    """
    ฟังก์ชันสำหรับตรวจสอบข้อมูลผู้ใช้จาก MongoDB

    Args:
        username (str): ชื่อผู้ใช้
        password (str): รหัสผ่าน

    Returns:
        dict: ข้อมูลผู้ใช้ถ้าพบ, None ถ้าไม่พบ
    """
    try:
        users_collection = db.users

        # ค้นหา user ในฐานข้อมูล
        user = users_collection.find_one({
            'username': username,
            'password': password
        })

        return user

    except Exception as e:
        print(f"Error during authentication: {str(e)}")
        return None

def validate_login_data(username, password):
    """
    ฟังก์ชันสำหรับตรวจสอบความถูกต้องของข้อมูล login

    Args:
        username (str): ชื่อผู้ใช้
        password (str): รหัสผ่าน

    Returns:
        tuple: (is_valid, error_message)
    """
    if not username or not password:
        return False, "กรุณาใส่ชื่อผู้ใช้และรหัสผ่าน"

    if len(username.strip()) == 0 or len(password.strip()) == 0:
        return False, "กรุณาใส่ชื่อผู้ใช้และรหัสผ่าน"

    return True, None

def register_user(username, password, email, full_name):
    """
    ฟังก์ชันสำหรับสมัครสมาชิกใหม่ใน MongoDB

    Args:
        username (str): ชื่อผู้ใช้
        password (str): รหัสผ่าน
        email (str): อีเมล
        full_name (str): ชื่อ-นามสกุล

    Returns:
        dict: {'success': bool, 'message': str}
    """
    try:
        users_collection = db.users

        # ตรวจสอบว่าชื่อผู้ใช้ซ้ำหรือไม่
        existing_user = users_collection.find_one({'username': username})
        if existing_user:
            return {'success': False, 'message': 'ชื่อผู้ใช้นี้มีอยู่แล้ว'}

        # ตรวจสอบว่าอีเมลซ้ำหรือไม่
        existing_email = users_collection.find_one({'email': email})
        if existing_email:
            return {'success': False, 'message': 'อีเมลนี้มีอยู่แล้ว'}

        # สร้าง user ใหม่
        new_user = {
            'username': username,
            'password': password,  # ในการใช้งานจริงควร hash password
            'email': email,
            'full_name': full_name,
            'created_at': datetime.now(),
            'is_active': True
        }

        result = users_collection.insert_one(new_user)

        if result.inserted_id:
            return {'success': True, 'message': 'ลงทะเบียนสำเร็จ'}
        else:
            return {'success': False, 'message': 'เกิดข้อผิดพลาดในการลงทะเบียน'}

    except Exception as e:
        print(f"Error during registration: {str(e)}")
        return {'success': False, 'message': f'เกิดข้อผิดพลาด: {str(e)}'}

def validate_register_data(username, password, confirm_password, email, full_name):
    """
    ฟังก์ชันสำหรับตรวจสอบความถูกต้องของข้อมูลสมัครสมาชิก

    Args:
        username (str): ชื่อผู้ใช้
        password (str): รหัสผ่าน
        confirm_password (str): ยืนยันรหัสผ่าน
        email (str): อีเมล
        full_name (str): ชื่อ-นามสกุล

    Returns:
        tuple: (is_valid, error_message)
    """
    if not all([username, password, confirm_password, email, full_name]):
        return False, "กรุณากรอกข้อมูลให้ครบทุกช่อง"

    if len(username.strip()) < 3:
        return False, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร"

    if len(password) < 6:
        return False, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"

    if password != confirm_password:
        return False, "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน"

    # ตรวจสอบรูปแบบอีเมลง่ายๆ
    if '@' not in email or '.' not in email:
        return False, "รูปแบบอีเมลไม่ถูกต้อง"

    if len(full_name.strip()) < 2:
        return False, "ชื่อ-นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร"

    return True, None
