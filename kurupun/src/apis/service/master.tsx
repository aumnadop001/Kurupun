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

