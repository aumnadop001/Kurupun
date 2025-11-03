# API Documentation for Form Endpoints

## Base URL
```
http://localhost:5000/api
```

## Authentication
All API endpoints require login. Include session cookies or use login API first.

## Response Format
All APIs return JSON in this format:
```json
{
  "success": true/false,
  "message": "status message",
  "data": {} // for GET requests
}
```

## Generic CRUD Patterns

### 1. List Records (GET)
```
GET /api/{module}?q={search}&page={page}&limit={limit}
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/withdrawal?q=document&page=1&limit=10" \
  -H "Content-Type: application/json" \
  --cookie-jar cookies.txt
```

### 2. Get Single Record (GET)
```
GET /api/{module}/{id}
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/withdrawal/REG001" \
  -H "Content-Type: application/json" \
  --cookie-jar cookies.txt
```

### 3. Create Record (POST)
```
POST /api/{module}
Content-Type: application/json
```

**Example:**
```bash
curl -X POST "http://localhost:5000/api/withdrawal" \
  -H "Content-Type: application/json" \
  --cookie-jar cookies.txt \
  -d '{
    "registerNo": "REG001",
    "registerDate": "2025-11-03",
    "documentName": "Test Document",
    "senderReceiver": "Test Sender",
    "firstItem": "Test Item",
    "filedDate": "2025-11-03",
    "relatedDocumentNo": "DOC001"
  }'
```

### 4. Update Record (PUT)
```
PUT /api/{module}/{id}
Content-Type: application/json
```

**Example:**
```bash
curl -X PUT "http://localhost:5000/api/withdrawal/REG001" \
  -H "Content-Type: application/json" \
  --cookie-jar cookies.txt \
  -d '{
    "registerNo": "REG001",
    "registerDate": "2025-11-03",
    "documentName": "Updated Document",
    "senderReceiver": "Updated Sender",
    "firstItem": "Updated Item",
    "filedDate": "2025-11-03",
    "relatedDocumentNo": "DOC001"
  }'
```

### 5. Delete Record (DELETE)
```
DELETE /api/{module}/{id}
```

**Example:**
```bash
curl -X DELETE "http://localhost:5000/api/withdrawal/REG001" \
  -H "Content-Type: application/json" \
  --cookie-jar cookies.txt
```

## Available Modules

### 1. Withdrawal (ทะเบียนใบเบิกเอกสาร)
- **Base URL:** `/api/withdrawal`
- **ID Field:** `registerNo`
- **Search Field:** `documentName`

**Fields:**
```json
{
  "registerNo": "string (required)",
  "registerDate": "YYYY-MM-DD (required)",
  "documentName": "string (required)",
  "senderReceiver": "string (required)",
  "firstItem": "string (required)",
  "filedDate": "YYYY-MM-DD (required)",
  "relatedDocumentNo": "string"
}
```

### 2. Inventory Control (คุมพัสดุ)
- **Base URL:** `/api/inventory_control`
- **ID Field:** `itemId`
- **Search Field:** `itemName`

**Fields:**
```json
{
  "date": "YYYY-MM-DD (required)",
  "evidence": "string (required)",
  "itemName": "string (required)",
  "itemNumber": "string",
  "unit": "string",
  "rate": "number",
  "acquisitionMethod": "string",
  "budgetType": "string",
  "pricePerUnit": "number",
  "receiveQuantity": "integer",
  "primaryNeed": "string",
  "replacementNeed": "string",
  "distributeQuantity": "integer",
  "remainingStock": "integer",
  "signature": "string (required)"
}
```

### 3. Asset Control (คุมครุภัณฑ์)
- **Base URL:** `/api/asset_control`
- **ID Field:** `registerNo`
- **Search Field:** `assetName`

**Fields:**
```json
{
  "registerNo": "string (required)",
  "registerDate": "YYYY-MM-DD (required)",
  "assetName": "string (required)",
  "assetUnit": "string",
  "quantity": "integer",
  "filedDate": "YYYY-MM-DD",
  "relatedDocumentNo": "string"
}
```

### 4. Asset Distribute (จ่ายครุภัณฑ์)
- **Base URL:** `/api/asset_distribute`
- **ID Field:** `registerNo`
- **Search Field:** `assetName`

**Fields:**
```json
{
  "registerNo": "string (required)",
  "registerDate": "YYYY-MM-DD (required)",
  "assetName": "string (required)",
  "assetNumber": "string",
  "receivingUnit": "string",
  "receiveEvidence": "string",
  "distributeEvidence": "string",
  "quantity": "integer",
  "distributeDate": "YYYY-MM-DD"
}
```

### 5. Fixed Asset (ทรัพย์สินถาวร)
- **Base URL:** `/api/fixed_asset`
- **ID Field:** `assetCode`
- **Search Field:** `assetName`

**Fields:**
```json
{
  "assetCode": "string (required)",
  "assetName": "string (required)",
  "category": "string",
  "purchaseDate": "YYYY-MM-DD",
  "price": "number",
  "location": "string",
  "condition": "string",
  "description": "string"
}
```

## Error Handling

### Common Error Responses:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Content-Type ต้องเป็น application/json"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "กรุณาเข้าสู่ระบบก่อน"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "ไม่พบข้อมูล"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "เกิดข้อผิดพลาด: error details"
}
```

## Quick Test Examples

### 1. Login First
```bash
curl -X POST "http://localhost:5000/api/login" \
  -H "Content-Type: application/json" \
  --cookie-jar cookies.txt \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

### 2. Create Withdrawal Record
```bash
curl -X POST "http://localhost:5000/api/withdrawal" \
  -H "Content-Type: application/json" \
  --cookie-jar cookies.txt \
  -d '{
    "registerNo": "W001",
    "registerDate": "2025-11-03",
    "documentName": "การเบิกเอกสาร",
    "senderReceiver": "แผนกบุคคล",
    "firstItem": "แบบฟอร์มใบลา",
    "filedDate": "2025-11-03",
    "relatedDocumentNo": "HR001"
  }'
```

### 3. Get All Withdrawal Records
```bash
curl -X GET "http://localhost:5000/api/withdrawal" \
  -H "Content-Type: application/json" \
  --cookie-jar cookies.txt
```

### 4. Search Records
```bash
curl -X GET "http://localhost:5000/api/withdrawal?q=เอกสาร&page=1&limit=5" \
  -H "Content-Type: application/json" \
  --cookie-jar cookies.txt
```

### 5. Update Record
```bash
curl -X PUT "http://localhost:5000/api/withdrawal/W001" \
  -H "Content-Type: application/json" \
  --cookie-jar cookies.txt \
  -d '{
    "registerNo": "W001",
    "registerDate": "2025-11-03",
    "documentName": "การเบิกเอกสาร (อัปเดต)",
    "senderReceiver": "แผนกบุคคล",
    "firstItem": "แบบฟอร์มใบลา",
    "filedDate": "2025-11-03",
    "relatedDocumentNo": "HR001"
  }'
```

### 6. Delete Record
```bash
curl -X DELETE "http://localhost:5000/api/withdrawal/W001" \
  -H "Content-Type: application/json" \
  --cookie-jar cookies.txt
```

## Using with JavaScript (Frontend)

### Example with Fetch API:
```javascript
// Login first
async function login() {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'your_username',
      password: 'your_password'
    })
  });
  return await response.json();
}

// Get records
async function getWithdrawals() {
  const response = await fetch('/api/withdrawal');
  return await response.json();
}

// Create record
async function createWithdrawal(data) {
  const response = await fetch('/api/withdrawal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return await response.json();
}

// Update record
async function updateWithdrawal(id, data) {
  const response = await fetch(`/api/withdrawal/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return await response.json();
}

// Delete record
async function deleteWithdrawal(id) {
  const response = await fetch(`/api/withdrawal/${id}`, {
    method: 'DELETE'
  });
  return await response.json();
}
```

## Features

- ✅ **Auto-increment IDs** - IDs are generated automatically
- ✅ **Date formatting** - Dates are properly formatted
- ✅ **Data validation** - Validates required fields and data types
- ✅ **Search functionality** - Search by specified fields
- ✅ **Pagination** - Support for page and limit parameters
- ✅ **Error handling** - Comprehensive error responses
- ✅ **Session management** - Requires login for all operations
- ✅ **Generic functions** - Easy to extend for new modules