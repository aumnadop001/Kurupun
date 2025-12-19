import { callGet} from "../call-api"

interface Params {
  page?: number;
  page_size?: number;
  search?: string;
}

export const fetchMaster = async (params?: Params) => {
  try {
    const response = await callGet("/api/master/", params);
    return response;
  } catch (error) {
    console.error("Fetch master data failed:", error);
    throw error;
  }
}

export const fetchDescriptionsList = async (params?: any) => {
  try {
    const response = await callGet("/api/descriptions/", params);
    return response;
  } catch (error) {
    console.error("Fetch descriptions failed:", error);
    throw error;
  }
}

