import { callGet, callPost } from "../call-api"

interface Params {
  page?: number;
  page_size?: number;
  search?: string;
}

export const fetchDocumentRegistries = async (params?: Params) => {
  try {
    const response = await callGet("/api/document-registries/", params);
    return response;
  } catch (error) {
    console.error("Fetch document registries failed:", error);
    throw error;
  }
}

export const fetchDocumentRegistryById = async (id: string) => {
  try {
    const response = await callGet(`/api/document-registries/${id}/`);
    return response;
  } catch (error) {
    console.error("Fetch document registry by ID failed:", error);
    throw error;
  }
}

export const createDocumentRegistry = async (data: any) => {
  try {
    const response = await callPost("/api/document-registries/", data);
    return response;
  } catch (error) {
    console.error("Create document registry failed:", error);
    throw error;
  }
}

export const updateDocumentRegistry = async (id: string, data: any) => {
  try {
    const response = await callPost(`/api/document-registries/${id}/`, data);
    return response;
  } catch (error) {
    console.error("Update document registry failed:", error);
    throw error;
  }
}

export const deleteDocumentRegistry = async (id: number) => {
  try {
    const response = await callPost(`/api/document-registries/${id}/delete/`);
    return response;
  } catch (error) {
    console.error("Delete document registry failed:", error);
    throw error;
  }
}