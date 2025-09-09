from pymongo import MongoClient
from dotenv import load_dotenv
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
