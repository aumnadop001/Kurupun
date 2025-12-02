import { callDelete, callGet, callPost, callPut } from "../call-api"

interface Params {
  page?: number;
  page_size?: number;
  search?: string;
}

export const fetchItems = async (params?: Params) => {
  try {
    const response = await callGet("/api/document-control/items/", params);
    return response;
  } catch (error) {
    console.error("Fetch items failed:", error);
    throw error;
  }
}

export const fetchItemById = async (id: string) => {
  try {
    const response = await callGet(`/api/document-control/items/${id}/`);
    return response;
  } catch (error) {
    console.error("Fetch item by ID failed:", error);
    throw error;
  }
}

export const createItem = async (data: any) => {
  try {
    const response = await callPost("/api/document-control/items/", data);
    return response;
  } catch (error) {
    console.error("Create item failed:", error);
    throw error;
  }
}

export const updateItem = async (id: string, data: any) => {
  try {
    const response = await callPut(`/api/document-control/items/${id}/`, data);
    return response;
  } catch (error) {
    console.error("Update item failed:", error);
    throw error;
  }
}

export const deleteItem = async (id: number) => {
  try {
    const response = await callDelete(`/api/document-control/items/${id}/`);
    return response;
  } catch (error) {
    console.error("Delete item failed:", error);
    throw error;
  }
}
