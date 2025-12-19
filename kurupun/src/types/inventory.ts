export interface Inventory {
  id?: number;
  document_record?: number;
  // ค้างรับ และ ค้างจ่าย
  pending_date: string;
  pending_evidence: string;
  pending_unit: string;
  pending_quantity?: number;
  pending_receive1?: number;
  pending_balance1?: number;
  pending_receive2?: number;
  pending_balance2?: number;
  pending_receive3?: number;
  pending_balance3?: number;
  pending_receive4?: number;
  pending_balance4?: number;
  pending_signature: string;
  // ความต้องการรับและจ่าย
  request_date: string;
  received_quantity: number;
  unit_price: string;
  request_evidence: string;
  request_type: 'INITIAL' | 'REPLACEMENT';
  issue_quantity: number;
  total_borrowed: number;
  stock_balance: number;
  request_signature: string;
}

export interface InventoryFormValues {
  document_record: string;
  pending_date: string;
  pending_evidence: string;
  pending_unit: string;
  pending_quantity: string;
  pending_receive1: string;
  pending_balance1: string;
  pending_receive2: string;
  pending_balance2: string;
  pending_receive3: string;
  pending_balance3: string;
  pending_receive4: string;
  pending_balance4: string;
  pending_signature: string;
  request_date: string;
  received_quantity: string;
  unit_price: string;
  request_evidence: string;
  request_type: string;
  issue_quantity: string;
  total_borrowed: string;
  stock_balance: string;
  request_signature: string;
}

export interface InventoryListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Inventory[];
}
