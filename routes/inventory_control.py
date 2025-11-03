from flask import Blueprint
from utils.helpers import (
    login_required,
    generic_list_view,
    generic_form_handler,
    generic_delete_handler,
    generic_api_list_handler,
    generic_api_form_handler,
    generic_api_get_handler,
    generic_api_delete_handler,
)
from utils.config import INVENTORY_FIELDS

inventory_bp = Blueprint("inventory_control", __name__, url_prefix="/inventory_control")


# WEB ROUTES
@inventory_bp.route("/")
@login_required
def list():
    return generic_list_view(
        collection_name="inventory_control",
        template_path="inventory_control/list.html",
        search_field="itemName",
        sort_field="date",
        sort_order=-1,
        date_fields=["date"],
    )


@inventory_bp.route("/add", methods=["GET", "POST"])
@login_required
def add():
    return generic_form_handler(
        collection_name="inventory_control",
        template_path="inventory_control/form.html",
        form_fields=INVENTORY_FIELDS,
        redirect_route="inventory_control.list",
        id_field="itemId",
        auto_increment_field="itemId",
        success_message="บันทึกข้อมูลสำเร็จ!",
    )


@inventory_bp.route("/edit/<item_id>", methods=["GET", "POST"])
@login_required
def edit(item_id):
    return generic_form_handler(
        collection_name="inventory_control",
        template_path="inventory_control/form.html",
        form_fields=INVENTORY_FIELDS,
        redirect_route="inventory_control.list",
        id_field="itemId",
        auto_increment_field="itemId",
        update_message="อัปเดตข้อมูลสำเร็จ!",
        item_id=item_id,
    )


@inventory_bp.route('/delete/<item_id>', methods=['POST'])
@login_required
def delete(item_id):
    """ลบข้อมูลการควบคุมสินค้าคงคลัง"""
    from flask import flash, redirect, url_for
    from pymongo import MongoClient
    import os
    
    # เชื่อมต่อ MongoDB
    client = MongoClient(os.getenv('MONGO_URI', 'mongodb://localhost:27017/'))
    db = client.kurupun
    
    try:
        # ลบข้อมูลจากฐานข้อมูล
        result = db.inventory_control.delete_one({"itemId": item_id})
        
        if result.deleted_count > 0:
            flash('ลบข้อมูลการควบคุมสินค้าคงคลังสำเร็จ', 'success')
        else:
            flash('ไม่พบข้อมูลที่ต้องการลบ', 'warning')
            
    except Exception as e:
        flash(f'เกิดข้อผิดพลาดในการลบข้อมูล: {str(e)}', 'error')
    
    return redirect(url_for('inventory_control.list'))


# API ROUTES
@inventory_bp.route("/api", methods=["GET"])
@login_required
def api_list():
    return generic_api_list_handler(
        collection_name="inventory_control",
        search_field="itemName",
        sort_field="date",
        sort_order=-1,
        date_fields=["date"],
    )


@inventory_bp.route("/api", methods=["POST"])
@login_required
def api_create():
    return generic_api_form_handler(
        collection_name="inventory_control",
        form_fields=INVENTORY_FIELDS,
        id_field="itemId",
        auto_increment_field="itemId",
    )


@inventory_bp.route("/api/<item_id>", methods=["GET"])
@login_required
def api_get(item_id):
    return generic_api_get_handler(
        collection_name="inventory_control",
        id_field="itemId",
        item_id=item_id,
        date_fields=["date"],
    )


@inventory_bp.route("/api/<item_id>", methods=["PUT"])
@login_required
def api_update(item_id):
    return generic_api_form_handler(
        collection_name="inventory_control",
        form_fields=INVENTORY_FIELDS,
        id_field="itemId",
        auto_increment_field="itemId",
        item_id=item_id,
    )


@inventory_bp.route("/api/<item_id>", methods=["DELETE"])
@login_required
def api_delete(item_id):
    return generic_api_delete_handler(
        collection_name="inventory_control", id_field="itemId", item_id=item_id
    )
