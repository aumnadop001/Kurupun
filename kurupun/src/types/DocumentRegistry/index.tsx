export type DocumentRegistryDataType = {
  count: number;
  results: {
    id: number;
    registry_number: string;
    registration_date: string;
    document_title: string;
    sender: string;
    first_item: string;
    storage_date: string;
    related_document_number: string;
    withdrawal_set_number: string;
  }[];
  next: null | string;
  previous: null | string;
}