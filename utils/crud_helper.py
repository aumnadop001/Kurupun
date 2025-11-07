"""
CRUD Helper สำหรับ MongoDB Collections
ใช้สำหรับสร้าง routes และ functions สำหรับ CRUD operations ได้ง่ายๆ
"""

from flask import request, render_template, redirect, url_for, flash
from datetime import datetime
from functools import wraps


def create_crud_routes(app, db, login_required):
    """
    สร้าง CRUD routes สำหรับ collection ใดๆ ก็ได้

    ตัวอย่างการใช้งาน:

    # สำหรับ withdrawal
    create_crud_routes(app, db, login_required).register(
        route_name='withdrawal',
        collection_name='requisition_register',
        id_field='registerNo',
        template_folder='withdrawal',
        date_fields=['registerDate', 'filedDate'],
        form_fields=['registerNo', 'registerDate', 'documentName', 'senderReceiver',
                     'firstItem', 'filedDate', 'relatedDocumentNo'],
        search_field='documentName',
        sequence_field='sequenceNo',
        sort_field='sequenceNo',
        sort_order=1
    )
    """

    class CRUDBuilder:
        def __init__(self, app, db, login_required):
            self.app = app
            self.db = db
            self.login_required = login_required

        def register(
            self,
            route_name,
            collection_name,
            id_field,
            template_folder,
            date_fields=[],
            form_fields=[],
            search_field=None,
            sequence_field=None,
            sort_field="_id",
            sort_order=-1,
            date_format="%Y-%m-%d",
            display_date_format="%Y-%m-%d",
        ):
            """
            ลงทะเบียน CRUD routes สำหรับ collection

            Parameters:
            - route_name: ชื่อ route (เช่น 'withdrawal', 'inventory_control')
            - collection_name: ชื่อ collection ใน MongoDB
            - id_field: field ที่ใช้เป็น ID (เช่น 'registerNo', 'itemId')
            - template_folder: โฟลเดอร์ template (เช่น 'withdrawal', 'inventory_control')
            - date_fields: list ของ field ที่เป็นวันที่
            - form_fields: list ของ field ทั้งหมดในฟอร์ม
            - search_field: field ที่ใช้ในการค้นหา
            - sequence_field: field ที่ใช้เป็น sequence number (auto increment)
            - sort_field: field ที่ใช้เรียงลำดับ
            - sort_order: 1=น้อยไปมาก, -1=มากไปน้อย
            - date_format: format วันที่ในฟอร์ม
            - display_date_format: format วันที่แสดงผล
            """
            collection = self.db[collection_name]

            # List route
            @self.app.route(f"/{route_name}", endpoint=f"{route_name}_list")
            @self.login_required
            def list_view():
                search_query = request.args.get("q", "").strip()

                if search_query and search_field:
                    filter_criteria = {
                        search_field: {"$regex": search_query, "$options": "i"}
                    }
                else:
                    filter_criteria = {}

                data = list(
                    collection.find(filter_criteria, {"_id": 0}).sort(
                        sort_field, sort_order
                    )
                )

                for record in data:
                    for date_field in date_fields:
                        if date_field in record and record[date_field]:
                            # ตรวจสอบว่าเป็น datetime object ก่อนแปลง
                            if hasattr(record[date_field], "strftime"):
                                record[date_field] = record[date_field].strftime(
                                    display_date_format
                                )
                            # ถ้าเป็น string อยู่แล้ว ไม่ต้องแปลง
                            elif isinstance(record[date_field], str):
                                record[date_field] = record[date_field]
                print("record ->", data)
                return render_template(f"{template_folder}/list.html", data=data)

            # Add route
            @self.app.route(
                f"/{route_name}/add",
                methods=["GET", "POST"],
                endpoint=f"{route_name}_add",
            )
            @self.login_required
            def add_view():
                return self._form_handler(
                    collection,
                    None,
                    id_field,
                    template_folder,
                    date_fields,
                    form_fields,
                    sequence_field,
                    date_format,
                    route_name,
                )

            # Edit route
            @self.app.route(
                f"/{route_name}/edit/<id_value>",
                methods=["GET", "POST"],
                endpoint=f"{route_name}_edit",
            )
            @self.login_required
            def edit_view(id_value):
                return self._form_handler(
                    collection,
                    id_value,
                    id_field,
                    template_folder,
                    date_fields,
                    form_fields,
                    sequence_field,
                    date_format,
                    route_name,
                )

            # Delete route
            @self.app.route(
                f"/{route_name}/delete/<id_value>",
                methods=["POST"],
                endpoint=f"{route_name}_delete",
            )
            @self.login_required
            def delete_view(id_value):
                record = collection.find_one({id_field: id_value}, {"_id": 0})

                if record:
                    result = collection.delete_one({id_field: id_value})
                    if result.deleted_count > 0:
                        flash("ลบข้อมูลสำเร็จ!", "success")
                    else:
                        flash("เกิดข้อผิดพลาดในการลบข้อมูล!", "error")
                else:
                    flash("ไม่พบข้อมูลที่ต้องการลบ!", "error")

                return redirect(url_for(f"{route_name}_list"))

        def _form_handler(
            self,
            collection,
            id_value,
            id_field,
            template_folder,
            date_fields,
            form_fields,
            sequence_field,
            date_format,
            route_name,
        ):
            """จัดการฟอร์ม add/edit"""
            record = None

            # แก้ไข: ดึงข้อมูลเดิม
            if id_value:
                record = collection.find_one({id_field: id_value}, {"_id": 0})
                if record:
                    for date_field in date_fields:
                        if date_field in record and record[date_field]:
                            # ตรวจสอบว่าเป็น datetime object ก่อนแปลง
                            if hasattr(record[date_field], "strftime"):
                                record[date_field] = record[date_field].strftime(
                                    date_format
                                )
                            # ถ้าเป็น string อยู่แล้ว ไม่ต้องแปลง
                            elif isinstance(record[date_field], str):
                                record[date_field] = record[date_field]

            # POST: บันทึกข้อมูล
            if request.method == "POST":
                record_data = {}

                # รวบรวมข้อมูลจากฟอร์ม
                for field in form_fields:
                    value = request.form.get(field, "").strip()

                    # แปลงวันที่
                    if field in date_fields and value:
                        try:
                            record_data[field] = datetime.strptime(value, date_format)
                        except:
                            record_data[field] = value
                    # แปลงตัวเลข
                    elif value:
                        # ลอง convert เป็น int/float ถ้าเป็นตัวเลข
                        try:
                            if "." in value:
                                record_data[field] = float(value)
                            else:
                                record_data[field] = int(value)
                        except:
                            record_data[field] = value
                    else:
                        record_data[field] = value

                # Generate sequence number สำหรับข้อมูลใหม่
                if sequence_field:
                    if not id_value:
                        last_record = collection.find_one(
                            {}, {sequence_field: 1}, sort=[(sequence_field, -1)]
                        )
                        if last_record and sequence_field in last_record:
                            try:
                                next_seq = int(last_record[sequence_field]) + 1
                            except (ValueError, TypeError):
                                next_seq = 1
                        else:
                            next_seq = 1
                        record_data[sequence_field] = str(next_seq)
                    else:
                        record_data[sequence_field] = (
                            record[sequence_field] if record else "1"
                        )

                # Update หรือ Insert
                if id_value:
                    collection.update_one({id_field: id_value}, {"$set": record_data})
                    flash("อัปเดตข้อมูลสำเร็จ!", "success")
                else:
                    collection.insert_one(record_data)
                    flash("บันทึกข้อมูลสำเร็จ!", "success")

                return redirect(url_for(f"{route_name}_list"))

            return render_template(
                f"{template_folder}/form.html",
                record=record,
                is_edit=(id_value is not None),
            )

    return CRUDBuilder(app, db, login_required)
