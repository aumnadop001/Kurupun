import { callDelete, callGet, callPost, callPut } from "../call-api"

interface Params {
  page?: number;
  page_size?: number;
  search?: string;
  document_registry?: string;
}

export const fetchInventoryRecords = async (params?: Params) => {
  try {
    const response = await callGet("/api/inventory-records/", params);
    return response;
  } catch (error) {
    console.error("Fetch inventory records failed:", error);
    throw error;
  }
}

export const fetchInventoryRecordById = async (id: string) => {
  try {
    const response = await callGet(`/api/inventory-records/${id}/`);
    return response;
  } catch (error) {
    console.error("Fetch inventory record by ID failed:", error);
    throw error;
  }
}

export const createInventoryRecord = async (data: any) => {
  try {
    const response = await callPost("/api/inventory-records/", data);
    return response;
  } catch (error) {
    console.error("Create inventory record failed:", error);
    throw error;
  }
}

export const updateInventoryRecord = async (id: string, data: any) => {
  try {
    const response = await callPut(`/api/inventory-records/${id}/`, data);
    return response;
  } catch (error) {
    console.error("Update inventory record failed:", error);
    throw error;
  }
}

export const deleteInventoryRecord = async (id: number) => {
  try {
    const response = await callDelete(`/api/inventory-records/${id}/`);
    return response;
  } catch (error) {
    console.error("Delete inventory record failed:", error);
    throw error;
  }
}
