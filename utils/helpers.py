from flask import jsonify, request, render_template, redirect, url_for, flash, session
from pymongo import MongoClient
from datetime import datetime
from functools import wraps
import os

# Database connection
mongoURI = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = MongoClient(mongoURI)
db = client["kurupun"]

def get_mongodb_connection():
    return db

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "logged_in" not in session or not session["logged_in"]:
            flash("กรุณาเข้าสู่ระบบก่อน", "error")
            return redirect(url_for("auth.login"))
        return f(*args, **kwargs)
    return decorated_function

# ===========================================
# GENERIC API FUNCTIONS - COPY & USE EASILY
# ===========================================

def generic_api_form_handler(
    collection_name,
    form_fields,
    id_field,
    auto_increment_field=None,
    item_id=None,
):
    """
    Generic API form handler for add/edit operations via JSON
    Returns JSON responses instead of redirects
    """
    try:
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

        collection = db[collection_name]
        record_data = {}

        # Validate and process form fields
        for form_field, db_field in form_fields.items():
            value = data.get(form_field, '')

            # Handle different data types
            if 'Date' in form_field or 'date' in form_field:
                if value:
                    try:
                        record_data[db_field] = datetime.strptime(value, '%Y-%m-%d')
                    except ValueError:
                        return jsonify({
                            'success': False,
                            'message': f'รูปแบบวันที่ไม่ถูกต้องสำหรับ {form_field}'
                        }), 400
            elif form_field in ['rate', 'pricePerUnit', 'price']:
                try:
                    record_data[db_field] = float(value) if value else 0.0
                except ValueError:
                    return jsonify({
                        'success': False,
                        'message': f'รูปแบบตัวเลขไม่ถูกต้องสำหรับ {form_field}'
                    }), 400
            elif form_field in ['receiveQuantity', 'distributeQuantity', 'remainingStock', 'quantity']:
                try:
                    record_data[db_field] = int(value) if value else 0
                except ValueError:
                    return jsonify({
                        'success': False,
                        'message': f'รูปแบบจำนวนไม่ถูกต้องสำหรับ {form_field}'
                    }), 400
            else:
                record_data[db_field] = value

        # Handle auto-increment for new records
        if not item_id and auto_increment_field:
            last_record = collection.find_one(
                {}, {auto_increment_field: 1}, sort=[(auto_increment_field, -1)]
            )
            if last_record and auto_increment_field in last_record:
                try:
                    next_id = int(last_record[auto_increment_field]) + 1
                except (ValueError, TypeError):
                    next_id = 1
            else:
                next_id = 1
            record_data[auto_increment_field] = str(next_id)
        elif item_id:
            record_data[id_field] = item_id

        if item_id:
            # Update existing record
            result = collection.update_one({id_field: item_id}, {"$set": record_data})
            if result.modified_count > 0:
                return jsonify({
                    'success': True,
                    'message': 'อัปเดตข้อมูลสำเร็จ!',
                    'data': record_data
                })
            else:
                return jsonify({
                    'success': False,
                    'message': 'ไม่พบข้อมูลที่ต้องการอัปเดต'
                }), 404
        else:
            # Insert new record
            collection.insert_one(record_data)
            return jsonify({
                'success': True,
                'message': 'บันทึกข้อมูลสำเร็จ!',
                'data': record_data
            })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'เกิดข้อผิดพลาด: {str(e)}'
        }), 500

def generic_api_list_handler(
    collection_name,
    search_field=None,
    sort_field=None,
    sort_order=1,
    date_fields=None
):
    """
    Generic API list handler - returns JSON data
    """
    try:
        collection = db[collection_name]
        search_query = request.args.get('q', '').strip()
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        skip = (page - 1) * limit

        if search_query and search_field:
            filter_criteria = {search_field: {"$regex": search_query, "$options": "i"}}
        else:
            filter_criteria = {}

        # Get total count
        total = collection.count_documents(filter_criteria)

        # Get data with pagination
        if sort_field:
            data = list(
                collection.find(filter_criteria, {"_id": 0})
                .sort(sort_field, sort_order)
                .skip(skip)
                .limit(limit)
            )
        else:
            data = list(
                collection.find(filter_criteria, {"_id": 0})
                .skip(skip)
                .limit(limit)
            )

        # Format date fields
        if date_fields:
            for record in data:
                for field in date_fields:
                    if field in record and record[field]:
                        record[field] = record[field].strftime('%Y-%m-%d')

        return jsonify({
            'success': True,
            'data': data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'total_pages': (total + limit - 1) // limit
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'เกิดข้อผิดพลาด: {str(e)}'
        }), 500

def generic_api_get_handler(collection_name, id_field, item_id, date_fields=None):
    """
    Generic API get single record handler
    """
    try:
        collection = db[collection_name]
        record = collection.find_one({id_field: item_id}, {"_id": 0})

        if not record:
            return jsonify({
                'success': False,
                'message': 'ไม่พบข้อมูล'
            }), 404

        # Format date fields
        if date_fields:
            for field in date_fields:
                if field in record and record[field]:
                    record[field] = record[field].strftime('%Y-%m-%d')

        return jsonify({
            'success': True,
            'data': record
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'เกิดข้อผิดพลาด: {str(e)}'
        }), 500

def generic_api_delete_handler(collection_name, id_field, item_id):
    """
    Generic API delete handler
    """
    try:
        collection = db[collection_name]
        record = collection.find_one({id_field: item_id}, {"_id": 0})

        if not record:
            return jsonify({
                'success': False,
                'message': 'ไม่พบข้อมูลที่ต้องการลบ'
            }), 404

        result = collection.delete_one({id_field: item_id})
        if result.deleted_count > 0:
            return jsonify({
                'success': True,
                'message': 'ลบข้อมูลสำเร็จ!'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'เกิดข้อผิดพลาดในการลบข้อมูล'
            }), 500

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'เกิดข้อผิดพลาด: {str(e)}'
        }), 500

def generic_list_view(
    collection_name,
    template_path,
    search_field=None,
    sort_field=None,
    sort_order=1,
    date_fields=None,
):
    """
    Generic list view function
    """
    collection = db[collection_name]
    search_query = request.args.get("q", "").strip()

    if search_query and search_field:
        filter_criteria = {search_field: {"$regex": search_query, "$options": "i"}}
    else:
        filter_criteria = {}

    if sort_field:
        data = list(
            collection.find(filter_criteria, {"_id": 0}).sort(sort_field, sort_order)
        )
    else:
        data = list(collection.find(filter_criteria, {"_id": 0}))

    if date_fields:
        for record in data:
            for field in date_fields:
                if field in record and record[field]:
                    record[field] = record[field].strftime("%Y-%m-%d")

    return render_template(template_path, data=data)

def generic_form_handler(
    collection_name,
    template_path,
    form_fields,
    redirect_route,
    id_field,
    success_message="บันทึกข้อมูลสำเร็จ!",
    update_message="อัปเดตข้อมูลสำเร็จ!",
    auto_increment_field=None,
    item_id=None,
):
    """
    Generic form handler for add/edit operations
    """
    collection = db[collection_name]
    record = None

    if item_id:
        record = collection.find_one({id_field: item_id}, {"_id": 0})
        if record:
            for field, value in record.items():
                if isinstance(value, datetime):
                    record[field] = value.strftime("%Y-%m-%d")

    if request.method == "POST":
        record_data = {}

        for form_field, db_field in form_fields.items():
            value = request.form.get(form_field, "")

            # Handle different data types
            if "Date" in form_field or "date" in form_field:
                if value:
                    record_data[db_field] = datetime.strptime(value, "%Y-%m-%d")
            elif form_field in ["rate", "pricePerUnit", "price"]:
                record_data[db_field] = float(value) if value else 0.0
            elif form_field in [
                "receiveQuantity",
                "distributeQuantity",
                "remainingStock",
                "quantity",
            ]:
                record_data[db_field] = int(value) if value else 0
            else:
                record_data[db_field] = value

        # Handle auto-increment for new records
        if not item_id and auto_increment_field:
            last_record = collection.find_one(
                {}, {auto_increment_field: 1}, sort=[(auto_increment_field, -1)]
            )
            if last_record and auto_increment_field in last_record:
                try:
                    next_id = int(last_record[auto_increment_field]) + 1
                except (ValueError, TypeError):
                    next_id = 1
            else:
                next_id = 1
            record_data[auto_increment_field] = str(next_id)
        elif item_id:
            record_data[id_field] = item_id

        if item_id:
            collection.update_one({id_field: item_id}, {"$set": record_data})
            flash(update_message, "success")
        else:
            collection.insert_one(record_data)
            flash(success_message, "success")

        return redirect(url_for(redirect_route))

    return render_template(template_path, record=record, is_edit=(item_id is not None))

def generic_delete_handler(
    collection_name,
    id_field,
    item_id,
    redirect_route,
    success_message="ลบข้อมูลสำเร็จ!",
    error_message="ไม่พบข้อมูลที่ต้องการลบ!",
):
    """
    Generic delete handler
    """
    collection = db[collection_name]
    record = collection.find_one({id_field: item_id}, {"_id": 0})

    if record:
        result = collection.delete_one({id_field: item_id})
        if result.deleted_count > 0:
            flash(success_message, "success")
        else:
            flash("เกิดข้อผิดพลาดในการลบข้อมูล!", "error")
    else:
        flash(error_message, "error")

    return redirect(url_for(redirect_route))