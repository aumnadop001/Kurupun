from flask import Flask, jsonify, request, render_template, redirect, url_for, flash, session
from pymongo import MongoClient
from datetime import datetime
from functools import wraps
from modules.login import authenticate_user, validate_login_data
from dotenv import load_dotenv
import os
load_dotenv()


app = Flask(__name__)
# จำเป็นสำหรับ flash messages และ session
app.secret_key = os.getenv('SECRET_KEY')
# ในการใช้งานจริง ควรใช้ environment variable หรือ secrets manager

mongoURI = os.getenv('MONGO_URL', 'mongodb://localhost:27017')

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
        if 'logged_in' not in session or not session['logged_in']:
            flash('กรุณาเข้าสู่ระบบก่อน', 'error')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# หน้าแรก


@app.route('/')
@login_required
def index():
    return render_template('index.html')

# 5 หน้าอื่น


@app.route('/withdrawal')
@login_required
def withdrawal():
    requisitionRegisterCol = db["requisition_register"]

    # รับค่าการค้นหาจาก query parameter
    search_query = request.args.get('q', '').strip()

    # สร้าง filter สำหรับการค้นหา
    if search_query:
        # ค้นหาโดยใช้ documentName
        filter_criteria = {
            # case-insensitive search
            "documentName": {"$regex": search_query, "$options": "i"}
        }
    else:
        filter_criteria = {}

    # จัดเรียงตามลำดับที่ (sequenceNo) จากน้อยไปมาก
    data = list(requisitionRegisterCol.find(
        filter_criteria, {'_id': 0}).sort("sequenceNo", 1))
    for record in data:
        if 'registerDate' in record:
            record['registerDate'] = record['registerDate'].strftime(
                '%Y-%m-%d')  # format 2023-06-19
        if 'filedDate' in record:
            record['filedDate'] = record['filedDate'].strftime(
                '%Y-%m-%d')  # format 2023-06-19
    return render_template('withdrawal/list.html', data=data)


@app.route('/withdrawal/add', methods=['GET', 'POST'])
@login_required
def add_withdrawal():
    return withdrawal_form()


@app.route('/withdrawal/edit/<register_no>', methods=['GET', 'POST'])
@login_required
def edit_withdrawal(register_no):
    return withdrawal_form(register_no)


def withdrawal_form(register_no=None):
    requisitionRegisterCol = db["requisition_register"]

    # ถ้าเป็นการแก้ไข ให้ดึงข้อมูลเดิมมา
    record = None
    if register_no:
        record = requisitionRegisterCol.find_one(
            {"registerNo": register_no}, {'_id': 0})
        if record:
            # แปลง datetime เป็น string สำหรับแสดงในฟอร์ม
            if 'registerDate' in record:
                record['registerDate'] = record['registerDate'].strftime(
                    '%Y-%m-%d')
            if 'filedDate' in record:
                record['filedDate'] = record['filedDate'].strftime('%Y-%m-%d')

    if request.method == 'POST':
        registerNo = request.form['registerNo']
        registerDate = datetime.strptime(
            request.form['registerDate'], '%Y-%m-%d')
        documentName = request.form['documentName']
        senderReceiver = request.form['senderReceiver']
        firstItem = request.form['firstItem']
        filedDate = datetime.strptime(request.form['filedDate'], '%Y-%m-%d')
        relatedDocumentNo = request.form['relatedDocumentNo']

        # สำหรับการเพิ่มข้อมูลใหม่ ให้ generate sequenceNo แบบ auto increment
        if not register_no:
            # หาลำดับที่สูงสุดในฐานข้อมูล
            last_record = requisitionRegisterCol.find_one(
                {},
                {"sequenceNo": 1},
                sort=[("sequenceNo", -1)]
            )
            if last_record and 'sequenceNo' in last_record:
                try:
                    next_seq = int(last_record['sequenceNo']) + 1
                except (ValueError, TypeError):
                    next_seq = 1
            else:
                next_seq = 1
            sequenceNo = str(next_seq)
        else:
            # สำหรับการแก้ไข ใช้ sequenceNo เดิม
            sequenceNo = record['sequenceNo'] if record else "1"

        record_data = {
            "sequenceNo": sequenceNo,
            "registerNo": registerNo,
            "registerDate": registerDate,
            "documentName": documentName,
            "senderReceiver": senderReceiver,
            "firstItem": firstItem,
            "filedDate": filedDate,
            "relatedDocumentNo": relatedDocumentNo
        }

        if register_no:  # อัปเดตข้อมูลเดิม
            requisitionRegisterCol.update_one(
                {"registerNo": register_no},
                {"$set": record_data}
            )
            flash('อัปเดตข้อมูลสำเร็จ!', 'success')
        else:  # เพิ่มข้อมูลใหม่
            requisitionRegisterCol.insert_one(record_data)
            flash('บันทึกข้อมูลสำเร็จ!', 'success')

        return redirect(url_for('withdrawal'))

    return render_template('withdrawal/form.html', record=record, is_edit=(register_no is not None))


@app.route('/withdrawal/delete/<register_no>', methods=['POST'])
@login_required
def delete_withdrawal(register_no):
    requisitionRegisterCol = db["requisition_register"]

    # ตรวจสอบว่ามีข้อมูลนี้อยู่หรือไม่
    record = requisitionRegisterCol.find_one(
        {"registerNo": register_no}, {'_id': 0})

    if record:
        # ลบข้อมูล
        result = requisitionRegisterCol.delete_one({"registerNo": register_no})

        if result.deleted_count > 0:
            flash('ลบข้อมูลสำเร็จ!', 'success')
        else:
            flash('เกิดข้อผิดพลาดในการลบข้อมูล!', 'error')
    else:
        flash('ไม่พบข้อมูลที่ต้องการลบ!', 'error')

    return redirect(url_for('withdrawal'))


@app.route('/inventory_control')
@login_required
def inventory_control():
    inventoryCol = db["inventory_control"]

    # รับค่าการค้นหาจาก query parameter
    search_query = request.args.get('q', '').strip()

    # สร้าง filter สำหรับการค้นหา
    if search_query:
        # ค้นหาโดยใช้ itemName
        filter_criteria = {
            # case-insensitive search
            "itemName": {"$regex": search_query, "$options": "i"}
        }
    else:
        filter_criteria = {}

    # จัดเรียงตามวันที่บันทึก
    data = list(inventoryCol.find(
        filter_criteria, {'_id': 0}).sort("date", -1))
    for record in data:
        if 'date' in record:
            record['date'] = record['date'].strftime(
                '%d/%m/%Y')  # format dd/mm/yyyy

    return render_template('inventory_control/list.html', data=data)


@app.route('/inventory_control/add', methods=['GET', 'POST'])
@login_required
def add_inventory():
    return inventory_form()


@app.route('/inventory_control/edit/<item_id>', methods=['GET', 'POST'])
@login_required
def edit_inventory(item_id):
    return inventory_form(item_id)


def inventory_form(item_id=None):
    inventoryCol = db["inventory_control"]

    # ถ้าเป็นการแก้ไข ให้ดึงข้อมูลเดิมมา
    record = None
    if item_id:
        record = inventoryCol.find_one({"itemId": item_id}, {'_id': 0})
        if record:
            # แปลง datetime เป็น string สำหรับแสดงในฟอร์ม
            if 'date' in record:
                record['date'] = record['date'].strftime('%Y-%m-%d')

    if request.method == 'POST':
        date = datetime.strptime(request.form['date'], '%Y-%m-%d')
        evidence = request.form['evidence']
        itemName = request.form['itemName']
        itemNumber = request.form['itemNumber']
        unit = request.form['unit']
        rate = float(request.form['rate'])
        acquisitionMethod = request.form['acquisitionMethod']
        budgetType = request.form['budgetType']
        pricePerUnit = float(request.form['pricePerUnit'])
        receiveQuantity = int(request.form['receiveQuantity'])
        primaryNeed = request.form.get('primaryNeed', '')
        replacementNeed = request.form.get('replacementNeed', '')
        distributeQuantity = int(request.form.get('distributeQuantity', 0))
        remainingStock = int(request.form['remainingStock'])
        signature = request.form['signature']

        # สำหรับการเพิ่มข้อมูลใหม่ ให้ generate itemId แบบ auto increment
        if not item_id:
            # หา ID ที่สูงสุดในฐานข้อมูล
            last_record = inventoryCol.find_one(
                {},
                {"itemId": 1},
                sort=[("itemId", -1)]
            )
            if last_record and 'itemId' in last_record:
                try:
                    next_id = int(last_record['itemId']) + 1
                except (ValueError, TypeError):
                    next_id = 1
            else:
                next_id = 1
            itemId = str(next_id)
        else:
            # สำหรับการแก้ไข ใช้ itemId เดิม
            itemId = item_id

        record_data = {
            "itemId": itemId,
            "date": date,
            "evidence": evidence,
            "itemName": itemName,
            "itemNumber": itemNumber,
            "unit": unit,
            "rate": rate,
            "acquisitionMethod": acquisitionMethod,
            "budgetType": budgetType,
            "pricePerUnit": pricePerUnit,
            "receiveQuantity": receiveQuantity,
            "primaryNeed": primaryNeed,
            "replacementNeed": replacementNeed,
            "distributeQuantity": distributeQuantity,
            "remainingStock": remainingStock,
            "signature": signature
        }

        if item_id:  # อัปเดตข้อมูลเดิม
            inventoryCol.update_one(
                {"itemId": item_id},
                {"$set": record_data}
            )
            flash('อัปเดตข้อมูลสำเร็จ!', 'success')
        else:  # เพิ่มข้อมูลใหม่
            inventoryCol.insert_one(record_data)
            flash('บันทึกข้อมูลสำเร็จ!', 'success')

        return redirect(url_for('inventory_control'))

    return render_template('inventory_control/form.html', record=record, is_edit=(item_id is not None))


@app.route('/inventory_control/delete/<item_id>', methods=['POST'])
@login_required
def delete_inventory(item_id):
    inventoryCol = db["inventory_control"]

    # ตรวจสอบว่ามีข้อมูลนี้อยู่หรือไม่
    record = inventoryCol.find_one({"itemId": item_id}, {'_id': 0})

    if record:
        # ลบข้อมูล
        result = inventoryCol.delete_one({"itemId": item_id})

        if result.deleted_count > 0:
            flash('ลบข้อมูลสำเร็จ!', 'success')
        else:
            flash('เกิดข้อผิดพลาดในการลบข้อมูล!', 'error')
    else:
        flash('ไม่พบข้อมูลที่ต้องการลบ!', 'error')

    return redirect(url_for('inventory_control'))


@app.route('/fixed_asset')
@login_required
def fixed_asset():
    return render_template('fixed_asset.html')


@app.route('/asset_distribute')
@login_required
def asset_distribute():
    return render_template('asset_distribute.html')


@app.route('/asset_control')
@login_required
def asset_control():
    return render_template('asset_control.html')

# หน้า Login


# API สำหรับตรวจสอบ Login ผ่าน MongoDB
@app.route('/api/login', methods=['POST'])
def api_login():
    try:
        # ตรวจสอบ Content-Type
        if not request.is_json:
            return jsonify({
                'success': False,
                'message': 'Content-Type ต้องเป็น application/json'
            }), 400

        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'ไม่พบข้อมูล JSON'
            }), 400

        username = data.get('username', '').strip()
        password = data.get('password', '').strip()

        # ตรวจสอบความถูกต้องของข้อมูล
        is_valid, error_message = validate_login_data(username, password)
        if not is_valid:
            return jsonify({
                'success': False,
                'message': error_message
            }), 400

        # ตรวจสอบข้อมูลผู้ใช้
        user = authenticate_user(username, password)

        if user:
            # สร้าง session
            session['logged_in'] = True
            session['user_id'] = str(user.get('_id', ''))
            session['username'] = user['username']

            return jsonify({
                'success': True,
                'message': 'เข้าสู่ระบบสำเร็จ',
                'user': {
                    'username': user['username']
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
            }), 401

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'เกิดข้อผิดพลาด: {str(e)}'
        }), 500


@app.route('/login', methods=['GET', 'POST'])
def login():
    # ถ้า user login แล้ว ให้ redirect ไปหน้าแรก
    if 'logged_in' in session and session['logged_in']:
        return redirect(url_for('index'))

    if request.method == 'POST':
        try:
            # ใช้ .get() แทน direct access เพื่อหลีกเลี่ยง KeyError
            username = request.form.get('username', '').strip()
            password = request.form.get('password', '').strip()

            # ตรวจสอบความถูกต้องของข้อมูล
            is_valid, error_message = validate_login_data(username, password)
            if not is_valid:
                return render_template('login.html', error=error_message)

            # ตรวจสอบข้อมูลผู้ใช้จาก MongoDB
            user = authenticate_user(username, password)

            if user:
                # สร้าง session
                session['logged_in'] = True
                session['user_id'] = str(user.get('_id', ''))
                session['username'] = user['username']

                flash('เข้าสู่ระบบสำเร็จ', 'success')
                return redirect(url_for('index'))
            else:
                return render_template('login.html', error="ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")

        except Exception as e:
            return render_template('login.html', error=f"เกิดข้อผิดพลาด: {str(e)}")

    return render_template('login.html')


@app.route('/logout')
def logout():
    # ล้าง session
    session.clear()
    flash('ออกจากระบบเรียบร้อยแล้ว', 'success')
    return redirect(url_for('login'))

# ทำให้ session ใช้ได้ใน template


@app.context_processor
def inject_user():
    return dict(
        session=session,
        is_logged_in=session.get('logged_in', False),
        current_user=session.get('username', '')
    )


if __name__ == "__main__":
    app.run(debug=True)
