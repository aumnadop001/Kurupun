# CRUD Functions Usage Guide

## ไฟล์นี้แสดงวิธีใช้งาน Generic CRUD Functions ที่สามารถ copy ไปใช้งานได้ง่าย

## 1. การสร้าง Collection ใหม่

### Step 1: กำหนด Field Configuration
```python
# เพิ่มในส่วน FIELD CONFIGURATIONS
YOUR_MODULE_FIELDS = {
    'fieldName1': 'dbFieldName1',
    'fieldName2': 'dbFieldName2',
    'date': 'date',
    'quantity': 'quantity',
    'price': 'price'
}
```

### Step 2: สร้าง Routes สำหรับ CRUD Operations

#### List View (แสดงรายการ)
```python
@app.route('/your_module')
@login_required
def your_module():
    return generic_list_view(
        collection_name="your_collection_name",
        template_path="your_module/list.html",
        search_field="name",  # field ที่ใช้ค้นหา
        sort_field="date",    # field ที่ใช้เรียง
        sort_order=-1,        # -1 = มากไปน้อย, 1 = น้อยไปมาก
        date_fields=['date', 'created_date']  # fields ที่เป็น datetime
    )
```

#### Add Form (เพิ่มข้อมูลใหม่)
```python
@app.route('/your_module/add', methods=['GET', 'POST'])
@login_required
def add_your_module():
    return generic_form_handler(
        collection_name="your_collection_name",
        template_path="your_module/form.html",
        form_fields=YOUR_MODULE_FIELDS,
        redirect_route="your_module",
        id_field="itemId",
        auto_increment_field="itemId",
        success_message="บันทึกข้อมูลสำเร็จ!"
    )
```

#### Edit Form (แก้ไขข้อมูล)
```python
@app.route('/your_module/edit/<item_id>', methods=['GET', 'POST'])
@login_required
def edit_your_module(item_id):
    return generic_form_handler(
        collection_name="your_collection_name",
        template_path="your_module/form.html",
        form_fields=YOUR_MODULE_FIELDS,
        redirect_route="your_module",
        id_field="itemId",
        auto_increment_field="itemId",
        update_message="อัปเดตข้อมูลสำเร็จ!",
        item_id=item_id
    )
```

#### Delete (ลบข้อมูล)
```python
@app.route('/your_module/delete/<item_id>', methods=['POST'])
@login_required
def delete_your_module(item_id):
    return generic_delete_handler(
        collection_name="your_collection_name",
        id_field="itemId",
        item_id=item_id,
        redirect_route="your_module"
    )
```

## 2. ตัวอย่างการใช้งานจริง

### การสร้าง Product Management
```python
# 1. กำหนด Fields
PRODUCT_FIELDS = {
    'productName': 'productName',
    'productCode': 'productCode',
    'price': 'price',
    'quantity': 'quantity',
    'category': 'category',
    'description': 'description',
    'createdDate': 'createdDate'
}

# 2. List Products
@app.route('/products')
@login_required
def products():
    return generic_list_view(
        collection_name="products",
        template_path="products/list.html",
        search_field="productName",
        sort_field="createdDate",
        sort_order=-1,
        date_fields=['createdDate']
    )

# 3. Add Product
@app.route('/products/add', methods=['GET', 'POST'])
@login_required
def add_product():
    return generic_form_handler(
        collection_name="products",
        template_path="products/form.html",
        form_fields=PRODUCT_FIELDS,
        redirect_route="products",
        id_field="productId",
        auto_increment_field="productId",
        success_message="เพิ่มสินค้าสำเร็จ!"
    )

# 4. Edit Product
@app.route('/products/edit/<product_id>', methods=['GET', 'POST'])
@login_required
def edit_product(product_id):
    return generic_form_handler(
        collection_name="products",
        template_path="products/form.html",
        form_fields=PRODUCT_FIELDS,
        redirect_route="products",
        id_field="productId",
        auto_increment_field="productId",
        update_message="อัปเดตสินค้าสำเร็จ!",
        item_id=product_id
    )

# 5. Delete Product
@app.route('/products/delete/<product_id>', methods=['POST'])
@login_required
def delete_product(product_id):
    return generic_delete_handler(
        collection_name="products",
        id_field="productId",
        item_id=product_id,
        redirect_route="products",
        success_message="ลบสินค้าสำเร็จ!"
    )
```

## 3. การปรับแต่ง Parameters

### generic_list_view Parameters:
- `collection_name`: ชื่อ MongoDB collection
- `template_path`: path ของ HTML template
- `search_field`: field ที่ใช้ในการค้นหา (optional)
- `sort_field`: field ที่ใช้เรียงลำดับ (optional)
- `sort_order`: 1 = ascending, -1 = descending
- `date_fields`: list ของ fields ที่เป็น datetime

### generic_form_handler Parameters:
- `collection_name`: ชื่อ MongoDB collection
- `template_path`: path ของ HTML template
- `form_fields`: dictionary mapping form fields กับ database fields
- `redirect_route`: route ที่จะ redirect หลังจากบันทึกสำเร็จ
- `id_field`: primary key field
- `auto_increment_field`: field ที่ต้องการ auto increment
- `item_id`: ID ของรายการที่จะแก้ไข (None สำหรับเพิ่มใหม่)

### generic_delete_handler Parameters:
- `collection_name`: ชื่อ MongoDB collection
- `id_field`: primary key field
- `item_id`: ID ของรายการที่จะลบ
- `redirect_route`: route ที่จะ redirect หลังจากลบ

## 4. Data Types ที่ Support

Functions จะจัดการ data types อัตโนมัติ:
- **Date fields**: ถ้าชื่อ field มี 'Date' หรือ 'date' จะแปลงเป็น datetime object
- **Float fields**: 'rate', 'pricePerUnit' จะแปลงเป็น float
- **Integer fields**: 'quantity', 'receiveQuantity', 'distributeQuantity', 'remainingStock' จะแปลงเป็น int
- **String fields**: ทั้งหมดที่เหลือจะเป็น string

## 5. Tips สำหรับการใช้งาน

1. **ตั้งชื่อ field ให้สื่อความหมาย** - ระบบจะจดจำ pattern ของชื่อ field
2. **ใช้ auto_increment_field** - สำหรับ primary key ที่ต้องการเลขลำดับอัตโนมัติ
3. **กำหนด date_fields** - สำหรับ fields ที่เป็น datetime เพื่อ format ให้ถูกต้อง
4. **ปรับ search_field** - เลือก field ที่เหมาะสมสำหรับการค้นหา
5. **ตั้ง sort_field และ sort_order** - เพื่อเรียงข้อมูลตามที่ต้องการ

## 6. ข้อดีของการใช้ Generic Functions

- **ลดการเขียนโค้ดซ้ำ** - ไม่ต้องเขียน CRUD operations ใหม่ทุกครั้ง
- **ความสม่ำเสมอ** - พฤติกรรมเหมือนกันทุก module
- **ง่ายต่อการ maintain** - แก้ที่เดียวใช้ได้ทุกที่
- **รวดเร็ว** - copy pattern แล้วใช้ได้เลย