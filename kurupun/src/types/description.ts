export interface Description {
  id?: number;
  class_id?: number;
  class_name?: string;
  type_id?: number;
  type_name?: string;
  Des_id?: string;
  Des_name?: string;
  gpsc_id?: number;
  gpsc_name?: string;
  keyword?: string;
  item_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DescriptionFormValues {
  class_id: string;
  type_id: string;
  Des_id: string;
  Des_name: string;
  gpsc_id: string;
  keyword: string;
}

export interface DescriptionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Description[];
}

export interface MasterData {
  ptype: PType[];
  pClass: PClass[];
  gpscode: GpsCode[];
  dept: Dept[];
  invoiceType: InvoiceType[];
}

export interface PType {
  id: number;
  ptype_id: string;
  ptype_name: string;
  class_id?: number;
  class_name?: string;
}

export interface PClass {
  id: number;
  class_id: string;
  class_name: string;
}

export interface GpsCode {
  id: number;
  gpsc_id: string;
  gpsc_name: string;
}

export interface Dept {
  id: number;
  dept_id: string;
  dept_name: string;
}

export interface InvoiceType {
  id: number;
  invioc_type: string;
  invioc_name: string;
}
