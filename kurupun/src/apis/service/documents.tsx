import { callGet, callPost, callPut, callPatch, callDelete } from "../call-api";
import { DocumentRecord, DocumentRecordListResponse } from "../../types/document";

interface Params {
  page?: number;
  page_size?: number;
  search?: string;
  registration_number?: string;
  document_type?: string;
  sender?: string;
  recipient?: string;
  storage_location?: string;
  ordering?: string;
}

export const fetchDocumentRecords = async (params?: Params): Promise<DocumentRecordListResponse> => {
  try {
    const response = await callGet("/api/documents/document-records/", params);
    return response;
  } catch (error) {
    console.error("Fetch document records failed:", error);
    throw error;
  }
};

export const fetchDocumentRecordById = async (id: number): Promise<DocumentRecord> => {
  try {
    const response = await callGet(`/api/documents/document-records/${id}/`);
    return response;
  } catch (error) {
    console.error("Fetch document record by id failed:", error);
    throw error;
  }
};

export const createDocumentRecord = async (data: any): Promise<DocumentRecord> => {
  try {
    const response = await callPost("/api/documents/document-records/", data);
    return response;
  } catch (error) {
    console.error("Create document record failed:", error);
    throw error;
  }
};

export const updateDocumentRecord = async (id: number, data: any): Promise<DocumentRecord> => {
  try {
    const response = await callPut(`/api/documents/document-records/${id}/`, data);
    return response;
  } catch (error) {
    console.error("Update document record failed:", error);
    throw error;
  }
};

export const partialUpdateDocumentRecord = async (id: number, data: any): Promise<DocumentRecord> => {
  try {
    const response = await callPatch(`/api/documents/document-records/${id}/`, data);
    return response;
  } catch (error) {
    console.error("Partial update document record failed:", error);
    throw error;
  }
};

export const deleteDocumentRecord = async (id: number): Promise<void> => {
  try {
    await callDelete(`/api/documents/document-records/${id}/`);
  } catch (error) {
    console.error("Delete document record failed:", error);
    throw error;
  }
};

export const exportDocumentRecordToExcel = async (id: number): Promise<Blob> => {
  try {
    const response = await callGet(`/api/documents/document-records/${id}/export-excel/`, {
      responseType: 'blob'
    });
    return response;
  } catch (error) {
    console.error("Export document record to excel failed:", error);
    throw error;
  }
};
