import { callDelete, callGet, callPost, callPut } from "../call-api"

interface Params {
  page?: number;
  page_size?: number;
  search?: string;
  document_registry?: string;
}

export const fetchInventory = async (params?: Params) => {
  try {
    const response = await callGet("/api/inventory/", params);
    return response;
  } catch (error) {
    console.error("Fetch inventory  failed:", error);
    throw error;
  }
}

export const fetchInventoryById = async (id: string) => {
  try {
    const response = await callGet(`/api/inventory/${id}/`);
    return response;
  } catch (error) {
    console.error("Fetch inventory record by ID failed:", error);
    throw error;
  }
}

export const createInventory = async (data: any) => {
  try {
    const response = await callPost("/api/inventory/", data);
    return response;
  } catch (error) {
    console.error("Create inventory failed:", error);
    throw error;
  }
}

export const updateInventory = async (id: string, data: any) => {
  try {
    const response = await callPut(`/api/inventory/${id}/`, data);
    return response;
  } catch (error) {
    console.error("Update inventory failed:", error);
    throw error;
  }
}

export const deleteInventory = async (id: number) => {
  try {
    const response = await callDelete(`/api/inventory/${id}/`);
    return response;
  } catch (error) {
    console.error("Delete inventory failed:", error);
    throw error;
  }
}
