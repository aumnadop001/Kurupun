export interface DocumentRecord {
  id?: number;
  registerNo?: string;
  registration_number: string;
  registration_date: string;
  document_type: string;
  sender: string;
  recipient: string;
  first_item: string;
  inventory_number?: string;
  unit_of_measure: string;
  file_storage_date: string;
  related_document_number?: string;
  remark?: string;
  related_equipment?: string[];
  inventory_alternate_numbers?: string[];
  days_to_order?: number;
  quantity_to_order?: number;
  reorder_point_days?: number;
  reorder_point_quantity?: number;
  safety_stock_days?: number;
  safety_stock_quantity?: number;
  storage_location?: string;
  inventories_count?: number;
  requester_set_number?: string;
  requester_name?: string;
}

export interface DocumentRecordFormValues {
  registerNo: string;
  registration_number: string;
  registration_date: string;
  document_type: string;
  sender: string;
  recipient: string;
  first_item: string;
  inventory_number: string;
  unit_of_measure: string;
  file_storage_date: string;
  related_document_number: string;
  remark: string;
  related_equipment: string;
  inventory_alternate_numbers: string;
  days_to_order: string;
  quantity_to_order: string;
  reorder_point_days: string;
  reorder_point_quantity: string;
  safety_stock_days: string;
  safety_stock_quantity: string;
  storage_location: string;
  requester_set_number: string;
  requester_name: string;
}

export interface DocumentRecordListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DocumentRecord[];
}
