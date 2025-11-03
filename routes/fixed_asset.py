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
from utils.config import FIXED_ASSET_FIELDS

fixed_asset_bp = Blueprint("fixed_asset", __name__, url_prefix="/fixed_asset")


# WEB ROUTES
@fixed_asset_bp.route("/")
@login_required
def list():
    return render_template("fixed_asset.html")


@fixed_asset_bp.route("/add", methods=["GET", "POST"])
@login_required
def add():
    return generic_form_handler(
        collection_name="fixed_assets",
        template_path="fixed_asset/form.html",
        form_fields=FIXED_ASSET_FIELDS,
        redirect_route="fixed_asset.list",
        id_field="assetCode",
        auto_increment_field="assetCode",
        success_message="บันทึกข้อมูลทรัพย์สินถาวรสำเร็จ!",
    )


@fixed_asset_bp.route("/edit/<asset_code>", methods=["GET", "POST"])
@login_required
def edit(asset_code):
    return generic_form_handler(
        collection_name="fixed_assets",
        template_path="fixed_asset/form.html",
        form_fields=FIXED_ASSET_FIELDS,
        redirect_route="fixed_asset.list",
        id_field="assetCode",
        auto_increment_field="assetCode",
        update_message="อัปเดตข้อมูลทรัพย์สินถาวรสำเร็จ!",
        item_id=asset_code,
    )


@fixed_asset_bp.route('/delete/<asset_code>', methods=['POST'])
@login_required
def delete(asset_code):
    """ลบข้อมูลครุภัณฑ์"""
    from flask import flash, redirect, url_for
    from pymongo import MongoClient
    import os
    
    # เชื่อมต่อ MongoDB
    client = MongoClient(os.getenv('MONGO_URI', 'mongodb://localhost:27017/'))
    db = client.kurupun
    
    try:
        # ลบข้อมูลจากฐานข้อมูล
        result = db.fixed_asset.delete_one({"assetCode": asset_code})
        
        if result.deleted_count > 0:
            flash('ลบข้อมูลครุภัณฑ์สำเร็จ', 'success')
        else:
            flash('ไม่พบข้อมูลที่ต้องการลบ', 'warning')
            
    except Exception as e:
        flash(f'เกิดข้อผิดพลาดในการลบข้อมูล: {str(e)}', 'error')
    
    return redirect(url_for('fixed_asset.list'))


# API ROUTES
@fixed_asset_bp.route("/api", methods=["GET"])
@login_required
def api_list():
    return generic_api_list_handler(
        collection_name="fixed_assets",
        search_field="assetName",
        sort_field="purchaseDate",
        sort_order=-1,
        date_fields=["purchaseDate"],
    )


@fixed_asset_bp.route("/api", methods=["POST"])
@login_required
def api_create():
    return generic_api_form_handler(
        collection_name="fixed_assets",
        form_fields=FIXED_ASSET_FIELDS,
        id_field="assetCode",
        auto_increment_field="assetCode",
    )


@fixed_asset_bp.route("/api/<asset_code>", methods=["GET"])
@login_required
def api_get(asset_code):
    return generic_api_get_handler(
        collection_name="fixed_assets",
        id_field="assetCode",
        item_id=asset_code,
        date_fields=["purchaseDate"],
    )


@fixed_asset_bp.route("/api/<asset_code>", methods=["PUT"])
@login_required
def api_update(asset_code):
    return generic_api_form_handler(
        collection_name="fixed_assets",
        form_fields=FIXED_ASSET_FIELDS,
        id_field="assetCode",
        auto_increment_field="assetCode",
        item_id=asset_code,
    )


@fixed_asset_bp.route("/api/<asset_code>", methods=["DELETE"])
@login_required
def api_delete(asset_code):
    return generic_api_delete_handler(
        collection_name="fixed_assets", id_field="assetCode", item_id=asset_code
    )
