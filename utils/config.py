# Field configurations for all modules

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

# Configuration for asset_control
ASSET_CONTROL_FIELDS = {
    "registerNo": "registerNo",
    "registerDate": "registerDate",
    "assetName": "assetName",
    "assetUnit": "assetUnit",
    "quantity": "quantity",
    "filedDate": "filedDate",
    "relatedDocumentNo": "relatedDocumentNo"
}

# Configuration for asset_distribute
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

# Configuration for fixed_asset
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