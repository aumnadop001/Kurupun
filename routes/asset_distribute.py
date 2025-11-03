from flask import Blueprint, render_template
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
from utils.config import ASSET_DISTRIBUTE_FIELDS

asset_distribute_bp = Blueprint(
    "asset_distribute", __name__, url_prefix="/asset_distribute"
)


# WEB ROUTES
@asset_distribute_bp.route("/")
@login_required
def list():
    return render_template("asset_distribute.html")


@asset_distribute_bp.route("/add", methods=["GET", "POST"])
@login_required
def add():
    return generic_form_handler(
        collection_name="asset_distribute_register",
        template_path="asset_distribute/form.html",
        form_fields=ASSET_DISTRIBUTE_FIELDS,
        redirect_route="asset_distribute.list",
        id_field="registerNo",
        auto_increment_field="sequenceNo",
        success_message="บันทึกข้อมูลบัญชีคุมครุภัณฑ์จ่ายสำเร็จ!",
    )


@asset_distribute_bp.route("/edit/<register_no>", methods=["GET", "POST"])
@login_required
def edit(register_no):
    return generic_form_handler(
        collection_name="asset_distribute_register",
        template_path="asset_distribute/form.html",
        form_fields=ASSET_DISTRIBUTE_FIELDS,
        redirect_route="asset_distribute.list",
        id_field="registerNo",
        auto_increment_field="sequenceNo",
        update_message="อัปเดตข้อมูลบัญชีคุมครุภัณฑ์จ่ายสำเร็จ!",
        item_id=register_no,
    )


@asset_distribute_bp.route('/delete/<register_no>', methods=['POST'])
@login_required
def delete(register_no):
    """ลบข้อมูลการจ่ายพัสดุ"""
    from flask import flash, redirect, url_for
    from pymongo import MongoClient
    import os
    
    # เชื่อมต่อ MongoDB
    client = MongoClient(os.getenv('MONGO_URI', 'mongodb://localhost:27017/'))
    db = client.kurupun
    
    try:
        # ลบข้อมูลจากฐานข้อมูล
        result = db.asset_distribute.delete_one({"registerNo": register_no})
        
        if result.deleted_count > 0:
            flash('ลบข้อมูลการจ่ายพัสดุสำเร็จ', 'success')
        else:
            flash('ไม่พบข้อมูลที่ต้องการลบ', 'warning')
            
    except Exception as e:
        flash(f'เกิดข้อผิดพลาดในการลบข้อมูล: {str(e)}', 'error')
    
    return redirect(url_for('asset_distribute.list'))


# API ROUTES
@asset_distribute_bp.route("/api", methods=["GET"])
@login_required
def api_list():
    return generic_api_list_handler(
        collection_name="asset_distribute_register",
        search_field="assetName",
        sort_field="sequenceNo",
        sort_order=1,
        date_fields=["registerDate", "distributeDate"],
    )


@asset_distribute_bp.route("/api", methods=["POST"])
@login_required
def api_create():
    return generic_api_form_handler(
        collection_name="asset_distribute_register",
        form_fields=ASSET_DISTRIBUTE_FIELDS,
        id_field="registerNo",
        auto_increment_field="sequenceNo",
    )


@asset_distribute_bp.route("/api/<register_no>", methods=["GET"])
@login_required
def api_get(register_no):
    return generic_api_get_handler(
        collection_name="asset_distribute_register",
        id_field="registerNo",
        item_id=register_no,
        date_fields=["registerDate", "distributeDate"],
    )


@asset_distribute_bp.route("/api/<register_no>", methods=["PUT"])
@login_required
def api_update(register_no):
    return generic_api_form_handler(
        collection_name="asset_distribute_register",
        form_fields=ASSET_DISTRIBUTE_FIELDS,
        id_field="registerNo",
        auto_increment_field="sequenceNo",
        item_id=register_no,
    )


@asset_distribute_bp.route("/api/<register_no>", methods=["DELETE"])
@login_required
def api_delete(register_no):
    return generic_api_delete_handler(
        collection_name="asset_distribute_register",
        id_field="registerNo",
        item_id=register_no,
    )
