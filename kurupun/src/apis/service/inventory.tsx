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

export const getLatestStockBalance = async (documentRecordId: number): Promise<{ stock_balance: number }> => {
  try {
    const response = await callGet(`/api/documents/inventories/latest-stock-balance/`, { document_record: documentRecordId });
    return response;
  } catch (error) {
    console.error("Get latest stock balance failed:", error);
    throw error;
  }
};

// ===== Transaction APIs =====
export const addInventoryTransaction = async (inventoryId: number, data: any): Promise<any> => {
  try {
    const response = await callPost(`/api/documents/inventories/${inventoryId}/add-transaction/`, data);
    return response;
  } catch (error) {
    console.error("Add inventory transaction failed:", error);
    throw error;
  }
};

export const getInventoryTransactions = async (inventoryId: number): Promise<any[]> => {
  try {
    const response = await callGet(`/api/documents/inventories/${inventoryId}/transactions/`);
    return response;
  } catch (error) {
    console.error("Get inventory transactions failed:", error);
    throw error;
  }
};

export const clearInventoryTransactions = async (inventoryId: number): Promise<any> => {
  try {
    const response = await callDelete(`/api/documents/inventories/${inventoryId}/clear-transactions/`);
    return response;
  } catch (error) {
    console.error("Clear inventory transactions failed:", error);
    throw error;
  }
};

