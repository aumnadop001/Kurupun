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
from utils.config import WITHDRAWAL_FIELDS

withdrawal_bp = Blueprint("withdrawal", __name__, url_prefix="/withdrawal")


# WEB ROUTES
@withdrawal_bp.route("/")
@login_required
def list():
    return generic_list_view(
        collection_name="requisition_register",
        template_path="withdrawal/list.html",
        search_field="documentName",
        sort_field="sequenceNo",
        sort_order=1,
        date_fields=["registerDate", "filedDate"],
    )


@withdrawal_bp.route("/add", methods=["GET", "POST"])
@login_required
def add():
    return generic_form_handler(
        collection_name="requisition_register",
        template_path="withdrawal/form.html",
        form_fields=WITHDRAWAL_FIELDS,
        redirect_route="withdrawal.list",
        id_field="registerNo",
        auto_increment_field="sequenceNo",
        success_message="บันทึกข้อมูลสำเร็จ!",
    )


@withdrawal_bp.route("/edit/<register_no>", methods=["GET", "POST"])
@login_required
def edit(register_no):
    return generic_form_handler(
        collection_name="requisition_register",
        template_path="withdrawal/form.html",
        form_fields=WITHDRAWAL_FIELDS,
        redirect_route="withdrawal.list",
        id_field="registerNo",
        auto_increment_field="sequenceNo",
        update_message="อัปเดตข้อมูลสำเร็จ!",
        item_id=register_no,
    )


@withdrawal_bp.route('/delete/<register_no>', methods=['POST'])
@login_required
def delete(register_no):
    """ลบข้อมูลทะเบียนใบเบิกเอกสาร"""
    from flask import flash, redirect, url_for
    from pymongo import MongoClient
    import os
    
    # เชื่อมต่อ MongoDB
    client = MongoClient(os.getenv('MONGO_URI', 'mongodb://localhost:27017/'))
    db = client.kurupun
    
    try:
        # ลบข้อมูลจากฐานข้อมูล
        result = db.withdrawal.delete_one({"registerNo": register_no})
        
        if result.deleted_count > 0:
            flash('ลบข้อมูลทะเบียนใบเบิกเอกสารสำเร็จ', 'success')
        else:
            flash('ไม่พบข้อมูลที่ต้องการลบ', 'warning')
            
    except Exception as e:
        flash(f'เกิดข้อผิดพลาดในการลบข้อมูล: {str(e)}', 'error')
    
    return redirect(url_for('withdrawal.list'))


# API ROUTES
@withdrawal_bp.route("/api", methods=["GET"])
@login_required
def api_list():
    return generic_api_list_handler(
        collection_name="requisition_register",
        search_field="documentName",
        sort_field="sequenceNo",
        sort_order=1,
        date_fields=["registerDate", "filedDate"],
    )


@withdrawal_bp.route("/api", methods=["POST"])
@login_required
def api_create():
    return generic_api_form_handler(
        collection_name="requisition_register",
        form_fields=WITHDRAWAL_FIELDS,
        id_field="registerNo",
        auto_increment_field="sequenceNo",
    )


@withdrawal_bp.route("/api/<register_no>", methods=["GET"])
@login_required
def api_get(register_no):
    return generic_api_get_handler(
        collection_name="requisition_register",
        id_field="registerNo",
        item_id=register_no,
        date_fields=["registerDate", "filedDate"],
    )


@withdrawal_bp.route("/api/<register_no>", methods=["PUT"])
@login_required
def api_update(register_no):
    return generic_api_form_handler(
        collection_name="requisition_register",
        form_fields=WITHDRAWAL_FIELDS,
        id_field="registerNo",
        auto_increment_field="sequenceNo",
        item_id=register_no,
    )


@withdrawal_bp.route("/api/<register_no>", methods=["DELETE"])
@login_required
def api_delete(register_no):
    return generic_api_delete_handler(
        collection_name="requisition_register",
        id_field="registerNo",
        item_id=register_no,
    )
