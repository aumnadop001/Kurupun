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
from dotenv import load_dotenv
import os

load_dotenv()


app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "your-secret-key-here")
mongoURI = os.getenv("MONGO_URL", "mongodb://localhost:27017")
app.config["MONGO_URI"] = mongoURI

client = MongoClient(mongoURI)
db = client["kurupun"]


def get_mongodb_connection():
    return db


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "logged_in" not in session or not session["logged_in"]:
            flash("กรุณาเข้าสู่ระบบก่อน", "error")
            return redirect(url_for("login"))
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
            elif form_field in ['rate', 'pricePerUnit']:
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
    Args:
        collection_name: MongoDB collection name
        template_path: HTML template path
        search_field: Field to search in (optional)
        sort_field: Field to sort by (optional)
        sort_order: 1 for ascending, -1 for descending
        date_fields: List of date fields to format
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
    Args:
        collection_name: MongoDB collection name
        template_path: HTML template path
        form_fields: Dictionary of field mappings {'form_field': 'db_field'}
        redirect_route: Route to redirect after success
        id_field: Primary key field name
        success_message: Message for new records
        update_message: Message for updates
        auto_increment_field: Field to auto-increment for new records
        item_id: ID for editing (None for new records)
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
            elif form_field in ["rate", "pricePerUnit"]:
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


# ===========================================
# FIELD CONFIGURATIONS - EASY TO COPY & MODIFY
# ===========================================

# Configuration for withdrawal (requisition_register)
WITHDRAWAL_FIELDS = {
    "registerNo": "registerNo",
    "registerDate": "registerDate",
    "documentName": "documentName",
    "senderReceiver": "senderReceiver",
    "firstItem": "firstItem",
    "filedDate": "filedDate",
    "relatedDocumentNo": "relatedDocumentNo",
}

# Configuration for inventory_control
INVENTORY_FIELDS = {
    "date": "date",
    "evidence": "evidence",
    "itemName": "itemName",
    "itemNumber": "itemNumber",
    "unit": "unit",
    "rate": "rate",
    "acquisitionMethod": "acquisitionMethod",
    "budgetType": "budgetType",
    "pricePerUnit": "pricePerUnit",
    "receiveQuantity": "receiveQuantity",
    "primaryNeed": "primaryNeed",
    "replacementNeed": "replacementNeed",
    "distributeQuantity": "distributeQuantity",
    "remainingStock": "remainingStock",
    "signature": "signature",
}

# ===========================================
# ROUTE IMPLEMENTATIONS USING GENERIC FUNCTIONS
# ===========================================


@app.route("/")
@login_required
def index():
    return render_template("index.html")


# WITHDRAWAL ROUTES - COPY THIS PATTERN
@app.route("/withdrawal")
@login_required
def withdrawal():
    return generic_list_view(
        collection_name="requisition_register",
        template_path="withdrawal/list.html",
        search_field="documentName",
        sort_field="sequenceNo",
        sort_order=1,
        date_fields=["registerDate", "filedDate"],
    )


@app.route("/withdrawal/add", methods=["GET", "POST"])
@login_required
def add_withdrawal():
    return generic_form_handler(
        collection_name="requisition_register",
        template_path="withdrawal/form.html",
        form_fields=WITHDRAWAL_FIELDS,
        redirect_route="withdrawal",
        id_field="registerNo",
        auto_increment_field="sequenceNo",
        success_message="บันทึกข้อมูลสำเร็จ!",
    )


@app.route("/withdrawal/edit/<register_no>", methods=["GET", "POST"])
@login_required
def edit_withdrawal(register_no):
    return generic_form_handler(
        collection_name="requisition_register",
        template_path="withdrawal/form.html",
        form_fields=WITHDRAWAL_FIELDS,
        redirect_route="withdrawal",
        id_field="registerNo",
        auto_increment_field="sequenceNo",
        update_message="อัปเดตข้อมูลสำเร็จ!",
        item_id=register_no,
    )


@app.route("/withdrawal/delete/<register_no>", methods=["POST"])
@login_required
def delete_withdrawal(register_no):
    return generic_delete_handler(
        collection_name="requisition_register",
        id_field="registerNo",
        item_id=register_no,
        redirect_route="withdrawal",
    )


# INVENTORY CONTROL ROUTES - COPY THIS PATTERN
@app.route("/inventory_control")
@login_required
def inventory_control():
    return generic_list_view(
        collection_name="inventory_control",
        template_path="inventory_control/list.html",
        search_field="itemName",
        sort_field="date",
        sort_order=-1,
        date_fields=["date"],
    )


@app.route("/inventory_control/add", methods=["GET", "POST"])
@login_required
def add_inventory():
    return generic_form_handler(
        collection_name="inventory_control",
        template_path="inventory_control/form.html",
        form_fields=INVENTORY_FIELDS,
        redirect_route="inventory_control",
        id_field="itemId",
        auto_increment_field="itemId",
        success_message="บันทึกข้อมูลสำเร็จ!",
    )


@app.route("/inventory_control/edit/<item_id>", methods=["GET", "POST"])
@login_required
def edit_inventory(item_id):
    return generic_form_handler(
        collection_name="inventory_control",
        template_path="inventory_control/form.html",
        form_fields=INVENTORY_FIELDS,
        redirect_route="inventory_control",
        id_field="itemId",
        auto_increment_field="itemId",
        update_message="อัปเดตข้อมูลสำเร็จ!",
        item_id=item_id,
    )


@app.route("/inventory_control/delete/<item_id>", methods=["POST"])
@login_required
def delete_inventory(item_id):
    return generic_delete_handler(
        collection_name="inventory_control",
        id_field="itemId",
        item_id=item_id,
        redirect_route="inventory_control",
    )


# SIMPLE PAGE ROUTES
@app.route("/fixed_asset")
@login_required
def fixed_asset():
    return render_template("fixed_asset.html")


@app.route("/asset_distribute")
@login_required
def asset_distribute():
    return render_template("asset_distribute.html")


@app.route("/asset_control")
@login_required
def asset_control():
    return render_template("asset_control/list.html", data=[])


# ===========================================
# API ROUTES - JSON RESPONSES FOR FRONTEND
# ===========================================

# WITHDRAWAL API ROUTES
@app.route("/api/withdrawal", methods=["GET"])
@login_required
def api_withdrawal_list():
    return generic_api_list_handler(
        collection_name="requisition_register",
        search_field="documentName",
        sort_field="sequenceNo",
        sort_order=1,
        date_fields=["registerDate", "filedDate"]
    )

@app.route("/api/withdrawal", methods=["POST"])
@login_required
def api_withdrawal_create():
    return generic_api_form_handler(
        collection_name="requisition_register",
        form_fields=WITHDRAWAL_FIELDS,
        id_field="registerNo",
        auto_increment_field="sequenceNo"
    )

@app.route("/api/withdrawal/<register_no>", methods=["GET"])
@login_required
def api_withdrawal_get(register_no):
    return generic_api_get_handler(
        collection_name="requisition_register",
        id_field="registerNo",
        item_id=register_no,
        date_fields=["registerDate", "filedDate"]
    )

@app.route("/api/withdrawal/<register_no>", methods=["PUT"])
@login_required
def api_withdrawal_update(register_no):
    return generic_api_form_handler(
        collection_name="requisition_register",
        form_fields=WITHDRAWAL_FIELDS,
        id_field="registerNo",
        auto_increment_field="sequenceNo",
        item_id=register_no
    )

@app.route("/api/withdrawal/<register_no>", methods=["DELETE"])
@login_required
def api_withdrawal_delete(register_no):
    return generic_api_delete_handler(
        collection_name="requisition_register",
        id_field="registerNo",
        item_id=register_no
    )

# INVENTORY CONTROL API ROUTES
@app.route("/api/inventory_control", methods=["GET"])
@login_required
def api_inventory_list():
    return generic_api_list_handler(
        collection_name="inventory_control",
        search_field="itemName",
        sort_field="date",
        sort_order=-1,
        date_fields=["date"]
    )

@app.route("/api/inventory_control", methods=["POST"])
@login_required
def api_inventory_create():
    return generic_api_form_handler(
        collection_name="inventory_control",
        form_fields=INVENTORY_FIELDS,
        id_field="itemId",
        auto_increment_field="itemId"
    )

@app.route("/api/inventory_control/<item_id>", methods=["GET"])
@login_required
def api_inventory_get(item_id):
    return generic_api_get_handler(
        collection_name="inventory_control",
        id_field="itemId",
        item_id=item_id,
        date_fields=["date"]
    )

@app.route("/api/inventory_control/<item_id>", methods=["PUT"])
@login_required
def api_inventory_update(item_id):
    return generic_api_form_handler(
        collection_name="inventory_control",
        form_fields=INVENTORY_FIELDS,
        id_field="itemId",
        auto_increment_field="itemId",
        item_id=item_id
    )

@app.route("/api/inventory_control/<item_id>", methods=["DELETE"])
@login_required
def api_inventory_delete(item_id):
    return generic_api_delete_handler(
        collection_name="inventory_control",
        id_field="itemId",
        item_id=item_id
    )

# ASSET CONTROL API ROUTES
ASSET_CONTROL_FIELDS = {
    "registerNo": "registerNo",
    "registerDate": "registerDate",
    "assetName": "assetName",
    "assetUnit": "assetUnit",
    "quantity": "quantity",
    "filedDate": "filedDate",
    "relatedDocumentNo": "relatedDocumentNo"
}

@app.route("/api/asset_control", methods=["GET"])
@login_required
def api_asset_control_list():
    return generic_api_list_handler(
        collection_name="asset_control_register",
        search_field="assetName",
        sort_field="sequenceNo",
        sort_order=1,
        date_fields=["registerDate", "filedDate"]
    )

@app.route("/api/asset_control", methods=["POST"])
@login_required
def api_asset_control_create():
    return generic_api_form_handler(
        collection_name="asset_control_register",
        form_fields=ASSET_CONTROL_FIELDS,
        id_field="registerNo",
        auto_increment_field="sequenceNo"
    )

@app.route("/api/asset_control/<register_no>", methods=["GET"])
@login_required
def api_asset_control_get(register_no):
    return generic_api_get_handler(
        collection_name="asset_control_register",
        id_field="registerNo",
        item_id=register_no,
        date_fields=["registerDate", "filedDate"]
    )

@app.route("/api/asset_control/<register_no>", methods=["PUT"])
@login_required
def api_asset_control_update(register_no):
    return generic_api_form_handler(
        collection_name="asset_control_register",
        form_fields=ASSET_CONTROL_FIELDS,
        id_field="registerNo",
        auto_increment_field="sequenceNo",
        item_id=register_no
    )

@app.route("/api/asset_control/<register_no>", methods=["DELETE"])
@login_required
def api_asset_control_delete(register_no):
    return generic_api_delete_handler(
        collection_name="asset_control_register",
        id_field="registerNo",
        item_id=register_no
    )

# ASSET DISTRIBUTE API ROUTES
ASSET_DISTRIBUTE_FIELDS = {
    "registerNo": "registerNo",
    "registerDate": "registerDate",
    "assetName": "assetName",
    "assetNumber": "assetNumber",
    "receivingUnit": "receivingUnit",
    "receiveEvidence": "receiveEvidence",
    "distributeEvidence": "distributeEvidence",
    "quantity": "quantity",
    "distributeDate": "distributeDate"
}

@app.route("/api/asset_distribute", methods=["GET"])
@login_required
def api_asset_distribute_list():
    return generic_api_list_handler(
        collection_name="asset_distribute_register",
        search_field="assetName",
        sort_field="sequenceNo",
        sort_order=1,
        date_fields=["registerDate", "distributeDate"]
    )

@app.route("/api/asset_distribute", methods=["POST"])
@login_required
def api_asset_distribute_create():
    return generic_api_form_handler(
        collection_name="asset_distribute_register",
        form_fields=ASSET_DISTRIBUTE_FIELDS,
        id_field="registerNo",
        auto_increment_field="sequenceNo"
    )

@app.route("/api/asset_distribute/<register_no>", methods=["GET"])
@login_required
def api_asset_distribute_get(register_no):
    return generic_api_get_handler(
        collection_name="asset_distribute_register",
        id_field="registerNo",
        item_id=register_no,
        date_fields=["registerDate", "distributeDate"]
    )

@app.route("/api/asset_distribute/<register_no>", methods=["PUT"])
@login_required
def api_asset_distribute_update(register_no):
    return generic_api_form_handler(
        collection_name="asset_distribute_register",
        form_fields=ASSET_DISTRIBUTE_FIELDS,
        id_field="registerNo",
        auto_increment_field="sequenceNo",
        item_id=register_no
    )

@app.route("/api/asset_distribute/<register_no>", methods=["DELETE"])
@login_required
def api_asset_distribute_delete(register_no):
    return generic_api_delete_handler(
        collection_name="asset_distribute_register",
        id_field="registerNo",
        item_id=register_no
    )

# FIXED ASSET API ROUTES
FIXED_ASSET_FIELDS = {
    "assetCode": "assetCode",
    "assetName": "assetName",
    "category": "category",
    "purchaseDate": "purchaseDate",
    "price": "price",
    "location": "location",
    "condition": "condition",
    "description": "description"
}

@app.route("/api/fixed_asset", methods=["GET"])
@login_required
def api_fixed_asset_list():
    return generic_api_list_handler(
        collection_name="fixed_assets",
        search_field="assetName",
        sort_field="purchaseDate",
        sort_order=-1,
        date_fields=["purchaseDate"]
    )

@app.route("/api/fixed_asset", methods=["POST"])
@login_required
def api_fixed_asset_create():
    return generic_api_form_handler(
        collection_name="fixed_assets",
        form_fields=FIXED_ASSET_FIELDS,
        id_field="assetCode",
        auto_increment_field="assetCode"
    )

@app.route("/api/fixed_asset/<asset_code>", methods=["GET"])
@login_required
def api_fixed_asset_get(asset_code):
    return generic_api_get_handler(
        collection_name="fixed_assets",
        id_field="assetCode",
        item_id=asset_code,
        date_fields=["purchaseDate"]
    )

@app.route("/api/fixed_asset/<asset_code>", methods=["PUT"])
@login_required
def api_fixed_asset_update(asset_code):
    return generic_api_form_handler(
        collection_name="fixed_assets",
        form_fields=FIXED_ASSET_FIELDS,
        id_field="assetCode",
        auto_increment_field="assetCode",
        item_id=asset_code
    )

@app.route("/api/fixed_asset/<asset_code>", methods=["DELETE"])
@login_required
def api_fixed_asset_delete(asset_code):
    return generic_api_delete_handler(
        collection_name="fixed_assets",
        id_field="assetCode",
        item_id=asset_code
    )


@app.route("/api/login", methods=["POST"])
def api_login():
    try:
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

        is_valid, error_message = validate_login_data(username, password)
        if not is_valid:
            return jsonify({"success": False, "message": error_message}), 400

        user = authenticate_user(username, password)
        if user:
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


@app.route("/api/register", methods=["POST"])
def api_register():
    try:
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

        is_valid, error_message = validate_register_data(
            username, password, confirm_password, email, full_name
        )
        if not is_valid:
            return jsonify({"success": False, "message": error_message}), 400

        result = register_user(username, password, email, full_name)
        if result["success"]:
            return jsonify({"success": True, "message": "สมัครสมาชิกสำเร็จ"})
        else:
            return jsonify({"success": False, "message": result["message"]}), 400

    except Exception as e:
        return jsonify({"success": False, "message": f"เกิดข้อผิดพลาด: {str(e)}"}), 500


@app.route("/login", methods=["GET", "POST"])
def login():
    if "logged_in" in session and session["logged_in"]:
        return redirect(url_for("index"))

    if request.method == "POST":
        try:
            username = request.form.get("username", "").strip()
            password = request.form.get("password", "").strip()

            is_valid, error_message = validate_login_data(username, password)
            if not is_valid:
                return render_template("login.html", error=error_message)

            user = authenticate_user(username, password)
            if user:
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
    if "logged_in" in session and session["logged_in"]:
        return redirect(url_for("index"))

    if request.method == "POST":
        try:
            username = request.form.get("username", "").strip()
            password = request.form.get("password", "").strip()
            confirm_password = request.form.get("confirm_password", "").strip()
            email = request.form.get("email", "").strip()
            full_name = request.form.get("full_name", "").strip()

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
    session.clear()
    flash("ออกจากระบบเรียบร้อยแล้ว", "success")
    return redirect(url_for("login"))


@app.context_processor
def inject_user():
    return dict(
        session=session,
        is_logged_in=session.get("logged_in", False),
        current_user=session.get("username", ""),
    )


if __name__ == "__main__":
    app.run(debug=True)
