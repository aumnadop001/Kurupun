from flask import (
    Flask,
    jsonify,
    request,
    render_template,
    redirect,
    url_for,
    flash,
    session,
)
from pymongo import MongoClient
from datetime import datetime
from functools import wraps
from modules.login import (
    authenticate_user,
    validate_login_data,
    register_user,
    validate_register_data,
)
from utils.crud_helper import create_crud_routes
from dotenv import load_dotenv
import os

load_dotenv()


app = Flask(__name__)
# จำเป็นสำหรับ flash messages และ session
app.secret_key = os.getenv("SECRET_KEY")
# ในการใช้งานจริง ควรใช้ environment variable หรือ secrets manager

mongoURI = os.getenv("MONGO_URL", "mongodb://localhost:27017")

# กำหนด connection string
app.config["MONGO_URI"] = mongoURI

# สร้าง object เชื่อมต่อ
client = MongoClient(mongoURI)
db = client["kurupun"]

# ฟังก์ชันสำหรับเชื่อมต่อ MongoDB


def get_mongodb_connection():
    return db


# Decorator สำหรับตรวจสอบการ login


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "logged_in" not in session or not session["logged_in"]:
            flash("กรุณาเข้าสู่ระบบก่อน", "error")
            return redirect(url_for("login"))
        return f(*args, **kwargs)

    return decorated_function


# หน้าแรก


@app.route("/")
@login_required
def index():
    return render_template("index.html")


# ========================================
# CRUD Helper - ใช้สร้าง routes แบบอัตโนมัติ
# ========================================
crud_builder = create_crud_routes(app, db, login_required)

# Withdrawal - ทะเบียนคุมใบเบิก
crud_builder.register(
    route_name="withdrawal",  # ชื่อ route (URL)
    collection_name="requisition_register",  # ชื่อ collection ใน MongoDB
    id_field="registerNo",  # field ที่ใช้เป็น ID
    template_folder="withdrawal",  # โฟลเดอร์ template
    date_fields=["registerDate", "filedDate"],  # field วันที่ทั้งหมด
    form_fields=[
        "registerNo",
        "registerDate",
        "documentName",
        "senderReceiver",
        "firstItem",
        "filedDate",
        "relatedDocumentNo",
    ],
    search_field="documentName",  # field ที่ใช้ค้นหา
    sequence_field="sequenceNo",  # field auto increment (ถ้ามี)
    sort_field="sequenceNo",  # field ที่ใช้เรียงลำดับ
    sort_order=1,  # 1=น้อย→มาก, -1=มาก→น้อย
)

# Inventory Control - บัญชีคุมพัสดุ (ครุภัณฑ์) - แบบ พ.3102-8
crud_builder.register(
    route_name="inventory_control",  # ชื่อ route (URL)
    collection_name="inventory_control",  # ชื่อ collection ใน MongoDB
    id_field="itemId",  # field ที่ใช้เป็น ID
    template_folder="inventory_control",  # โฟลเดอร์ template
    date_fields=["date"],  # field วันที่ทั้งหมด
    form_fields=[
        # ข้อมูลพัสดุหลัก
        "itemName",  # ชื่อพัสดุ
        "itemNumber",  # หมายเลขพัสดุ
        "unit",  # หน่วยนับ
        "rate",  # อัตรา
        # ข้อมูลทั่วไป
        "date",  # ว.ด.ป.
        "evidence",  # หลักฐาน
        "signature",  # ลายมือชื่อ
        "remainingStock",  # คงคลัง
        # ข้อมูลการรับ
        "acquisitionMethod",  # วิธีการได้มา
        "budgetType",  # ประเภทเงิน
        "pricePerUnit",  # ราคาต่อหน่วย
        "receiveQuantity",  # จำนวน (รับ)
        # ข้อมูลการจ่าย / ความต้องการ
        "primaryNeed",  # ความต้องการขั้นต้น
        "replacementNeed",  # ความต้องการทดแทน
        "distributeQuantity",  # จำนวน (จ่าย)
    ],  # field ที่ใช้ในฟอร์ม - เรียงตามโครงสร้างตาราง
    search_field="itemName",  # field ที่ใช้ค้นหา
    sequence_field="itemId",  # field auto increment (ถ้ามี)
    sort_field="date",  # field ที่ใช้เรียงลำดับ
    sort_order=-1,  # 1=น้อย→มาก, -1=มาก→น้อย
    display_date_format="%d/%m/%Y",  # format แสดงผล (ถ้าต่างจาก %Y-%m-%d)
)

# Asset Control - บัญชีคุมครุภัณฑ์ - แบบ พ. 3103-3
crud_builder.register(
    route_name="asset_control",  # ชื่อ route (URL)
    collection_name="asset_control",  # ชื่อ collection ใน MongoDB
    id_field="registerNo",  # field ที่ใช้เป็น ID
    template_folder="asset_control",  # โฟลเดอร์ template
    date_fields=["registerDate", "filedDate"],  # field วันที่ทั้งหมด
    form_fields=[
        # ข้อมูลทะเบียน
        "registerNo",  # เลขที่ทะเบียน
        "registerDate",  # วันที่ทะเบียน (ว.ด.ป.)
        "filedDate",  # วันที่ยื่นเอกสาร (ว.ด.ป.)
        "relatedDocumentNo",  # เลขที่เอกสารที่เกี่ยวข้อง
        # ข้อมูลครุภัณฑ์
        "assetName",  # ชื่อครุภัณฑ์
        "assetUnit",  # หน่วยนับ
        "quantity",  # จำนวน
    ],  # field ที่ใช้ในฟอร์ม - เรียงตามโครงสร้างตาราง
    search_field="assetName",  # field ที่ใช้ค้นหา
    sequence_field="sequenceNo",  # field auto increment (ถ้ามี)
    sort_field="registerNo",  # field ที่ใช้เรียงลำดับ
    sort_order=1,  # 1=น้อย→มาก, -1=มาก→น้อย
    display_date_format="%d/%m/%Y",  # format แสดงผล
)

# Asset Distribute - บัญชีคุมครุภัณฑ์จ่ายให้หน่วย - แบบ พ. 3108
crud_builder.register(
    route_name="asset_distribute",  # ชื่อ route (URL)
    collection_name="asset_distribute",  # ชื่อ collection ใน MongoDB
    id_field="registerNo",  # field ที่ใช้เป็น ID
    template_folder="asset_distribute",  # โฟลเดอร์ template
    date_fields=["registerDate", "distributeDate"],  # field วันที่ทั้งหมด
    form_fields=[
        # ข้อมูลทะเบียน
        "registerNo",  # เลขที่ทะเบียน
        "registerDate",  # วันที่ทะเบียน
        "distributeDate",  # วันที่จ่าย
        "receivingUnit",  # หน่วยที่รับ
        # ข้อมูลครุภัณฑ์
        "assetName",  # ชื่อครุภัณฑ์
        "assetNumber",  # หมายเลขพัสดุ
        "quantity",  # จำนวน
        # หลักฐาน
        "receiveEvidence",  # หลักฐานรับ
        "distributeEvidence",  # หลักฐานจ่าย
    ],  # field ที่ใช้ในฟอร์ม - เรียงตามโครงสร้างตาราง
    search_field="assetName",  # field ที่ใช้ค้นหา
    sequence_field="sequenceNo",  # field auto increment (ถ้ามี)
    sort_field="registerNo",  # field ที่ใช้เรียงลำดับ
    sort_order=1,  # 1=น้อย→มาก, -1=มาก→น้อย
    display_date_format="%d/%m/%Y",  # format แสดงผล
)

# Fixed Asset - บัญชีคุมเลขลำดับครุภัณฑ์ - แบบ พ. 3107
crud_builder.register(
    route_name="fixed_asset",  # ชื่อ route (URL)
    collection_name="fixed_asset",  # ชื่อ collection ใน MongoDB
    id_field="assetId",  # field ที่ใช้เป็น ID
    template_folder="fixed_asset",  # โฟลเดอร์ template
    date_fields=[],  # ไม่มี field วันที่
    form_fields=[
        # ข้อมูลพัสดุหลัก
        "assetName",  # ชื่อพัสดุ
        "assetNumber",  # หมายเลขพัสดุ
        # ข้อมูลครุภัณฑ์
        "assetSequenceNo",  # เลขลำดับครุภัณฑ์
        "receiveEvidence",  # หลักฐานรับ
        "issuedTo",  # จ่ายให้
        "issueEvidence",  # หลักฐานจ่าย
        "remark",  # หมายเหตุ
    ],  # field ที่ใช้ในฟอร์ม - เรียงตามโครงสร้างตาราง
    search_field="assetName",  # field ที่ใช้ค้นหา
    sequence_field="assetId",  # field auto increment (ถ้ามี)
    sort_field="assetSequenceNo",  # field ที่ใช้เรียงลำดับ
    sort_order=1,  # 1=น้อย→มาก, -1=มาก→น้อย
)

# หน้า Login


# API สำหรับตรวจสอบ Login ผ่าน MongoDB
@app.route("/api/login", methods=["POST"])
def api_login():
    try:
        # ตรวจสอบ Content-Type
        if not request.is_json:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Content-Type ต้องเป็น application/json",
                    }
                ),
                400,
            )

        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "ไม่พบข้อมูล JSON"}), 400

        username = data.get("username", "").strip()
        password = data.get("password", "").strip()

        # ตรวจสอบความถูกต้องของข้อมูล
        is_valid, error_message = validate_login_data(username, password)
        if not is_valid:
            return jsonify({"success": False, "message": error_message}), 400

        # ตรวจสอบข้อมูลผู้ใช้
        user = authenticate_user(username, password)

        if user:
            # สร้าง session
            session["logged_in"] = True
            session["user_id"] = str(user.get("_id", ""))
            session["username"] = user["username"]

            return jsonify(
                {
                    "success": True,
                    "message": "เข้าสู่ระบบสำเร็จ",
                    "user": {"username": user["username"]},
                }
            )
        else:
            return jsonify({"success": False, "message": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"}), 401

    except Exception as e:
        return jsonify({"success": False, "message": f"เกิดข้อผิดพลาด: {str(e)}"}), 500


# API สำหรับสมัครสมาชิกผ่าน JSON
@app.route("/api/register", methods=["POST"])
def api_register():
    try:
        # ตรวจสอบ Content-Type
        if not request.is_json:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Content-Type ต้องเป็น application/json",
                    }
                ),
                400,
            )

        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "ไม่พบข้อมูล JSON"}), 400

        username = data.get("username", "").strip()
        password = data.get("password", "").strip()
        confirm_password = data.get("confirm_password", "").strip()
        email = data.get("email", "").strip()
        full_name = data.get("full_name", "").strip()

        # ตรวจสอบความถูกต้องของข้อมูล
        is_valid, error_message = validate_register_data(
            username, password, confirm_password, email, full_name
        )
        if not is_valid:
            return jsonify({"success": False, "message": error_message}), 400

        # สมัครสมาชิก
        result = register_user(username, password, email, full_name)

        if result["success"]:
            return jsonify({"success": True, "message": "สมัครสมาชิกสำเร็จ"})
        else:
            return jsonify({"success": False, "message": result["message"]}), 400

    except Exception as e:
        return jsonify({"success": False, "message": f"เกิดข้อผิดพลาด: {str(e)}"}), 500


@app.route("/login", methods=["GET", "POST"])
def login():
    # ถ้า user login แล้ว ให้ redirect ไปหน้าแรก
    if "logged_in" in session and session["logged_in"]:
        return redirect(url_for("index"))

    if request.method == "POST":
        try:
            # ใช้ .get() แทน direct access เพื่อหลีกเลี่ยง KeyError
            username = request.form.get("username", "").strip()
            password = request.form.get("password", "").strip()

            # ตรวจสอบความถูกต้องของข้อมูล
            is_valid, error_message = validate_login_data(username, password)
            if not is_valid:
                return render_template("login.html", error=error_message)

            # ตรวจสอบข้อมูลผู้ใช้จาก MongoDB
            user = authenticate_user(username, password)

            if user:
                # สร้าง session
                session["logged_in"] = True
                session["user_id"] = str(user.get("_id", ""))
                session["username"] = user["username"]

                flash("เข้าสู่ระบบสำเร็จ", "success")
                return redirect(url_for("index"))
            else:
                return render_template("login.html", error="ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")

        except Exception as e:
            return render_template("login.html", error=f"เกิดข้อผิดพลาด: {str(e)}")

    return render_template("login.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    # ถ้า user login แล้ว ให้ redirect ไปหน้าแรก
    if "logged_in" in session and session["logged_in"]:
        return redirect(url_for("index"))

    if request.method == "POST":
        try:
            username = request.form.get("username", "").strip()
            password = request.form.get("password", "").strip()
            confirm_password = request.form.get("confirm_password", "").strip()
            email = request.form.get("email", "").strip()
            full_name = request.form.get("full_name", "").strip()

            # ตรวจสอบความถูกต้องของข้อมูล
            is_valid, error_message = validate_register_data(
                username, password, confirm_password, email, full_name
            )
            if not is_valid:
                return render_template(
                    "register.html",
                    error=error_message,
                    form_data={
                        "username": username,
                        "email": email,
                        "full_name": full_name,
                    },
                )

            # สมัครสมาชิก
            result = register_user(username, password, email, full_name)

            if result["success"]:
                flash("สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ", "success")
                return redirect(url_for("login"))
            else:
                return render_template(
                    "register.html",
                    error=result["message"],
                    form_data={
                        "username": username,
                        "email": email,
                        "full_name": full_name,
                    },
                )

        except Exception as e:
            return render_template("register.html", error=f"เกิดข้อผิดพลาด: {str(e)}")

    return render_template("register.html")


@app.route("/logout")
def logout():
    # ล้าง session
    session.clear()
    flash("ออกจากระบบเรียบร้อยแล้ว", "success")
    return redirect(url_for("login"))


# ทำให้ session ใช้ได้ใน template


@app.context_processor
def inject_user():
    return dict(
        session=session,
        is_logged_in=session.get("logged_in", False),
        current_user=session.get("username", ""),
    )


if __name__ == "__main__":
    # app.run(debug=True)
    app.run(host="0.0.0.0", port=5000, debug=True)
