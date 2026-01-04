import { callGet, callPost, callPut, callPatch, callDelete } from "../call-api";
import { Description, DescriptionFormValues } from "../../types/description";

interface Params {
  page?: number;
  page_size?: number;
  search?: string;
  class_id?: number;
  type_id?: number;
  gpsc_id?: number;
}

export const fetchMaster = async (params?: Params) => {
  try {
    const response = await callGet("/api/master/", params);
    return response;
  } catch (error) {
    console.error("Fetch master data failed:", error);
    throw error;
  }
};

// Description APIs
export const fetchDescriptionsList = async (params?: Params) => {
  try {
    const response = await callGet("/api/descriptions/", params);
    return response;
  } catch (error) {
    console.error("Fetch descriptions failed:", error);
    throw error;
  }
};

export const fetchDescriptionById = async (id: number) => {
  try {
    const response = await callGet(`/api/descriptions/${id}/`);
    return response;
  } catch (error) {
    console.error("Fetch description failed:", error);
    throw error;
  }
};

export const createDescription = async (data: Partial<Description>) => {
  try {
    const response = await callPost("/api/descriptions/", data);
    return response;
  } catch (error) {
    console.error("Create description failed:", error);
    throw error;
  }
};

export const updateDescription = async (id: number, data: Partial<Description>) => {
  try {
    const response = await callPut(`/api/descriptions/${id}/`, data);
    return response;
  } catch (error) {
    console.error("Update description failed:", error);
    throw error;
  }
};

export const partialUpdateDescription = async (id: number, data: Partial<Description>) => {
  try {
    const response = await callPatch(`/api/descriptions/${id}/`, data);
    return response;
  } catch (error) {
    console.error("Partial update description failed:", error);
    throw error;
  }
};

export const deleteDescription = async (id: number) => {
  try {
    const response = await callDelete(`/api/descriptions/${id}/`);
    return response;
  } catch (error) {
    console.error("Delete description failed:", error);
    throw error;
  }
};

