import { callGet, callPost, callPut, callPatch, callDelete } from "../call-api";
import { Inventory, InventoryListResponse } from "../../types/inventory";

interface Params {
  page?: number;
  page_size?: number;
  search?: string;
  document_record?: number;
  request_type?: string;
  pending_date?: string;
  request_date?: string;
  ordering?: string;
}

export const fetchInventories = async (params?: Params): Promise<InventoryListResponse> => {
  try {
    const response = await callGet("/api/documents/inventories/", params);
    return response;
  } catch (error) {
    console.error("Fetch inventories failed:", error);
    throw error;
  }
};

export const fetchInventoryById = async (id: number): Promise<Inventory> => {
  try {
    const response = await callGet(`/api/documents/inventories/${id}/`);
    return response;
  } catch (error) {
    console.error("Fetch inventory by id failed:", error);
    throw error;
  }
};

export const createInventory = async (data: any): Promise<Inventory> => {
  try {
    const response = await callPost("/api/documents/inventories/", data);
    return response;
  } catch (error) {
    console.error("Create inventory failed:", error);
    throw error;
  }
};

export const updateInventory = async (id: number, data: any): Promise<Inventory> => {
  try {
    const response = await callPut(`/api/documents/inventories/${id}/`, data);
    return response;
  } catch (error) {
    console.error("Update inventory failed:", error);
    throw error;
  }
};

export const partialUpdateInventory = async (id: number, data: any): Promise<Inventory> => {
  try {
    const response = await callPatch(`/api/documents/inventories/${id}/`, data);
    return response;
  } catch (error) {
    console.error("Partial update inventory failed:", error);
    throw error;
  }
};

export const deleteInventory = async (id: number): Promise<void> => {
  try {
    await callDelete(`/api/documents/inventories/${id}/`);
  } catch (error) {
    console.error("Delete inventory failed:", error);
    throw error;
  }
};
