import { axiosService as axiosInstance } from "./axios.service";

/// --------- GET ---------
export const callGet = (url: string, params?: any) =>
  axiosInstance({ url })
    .get(url, { params: params })
    .then((response) => response.data)
    .catch((error) => {
      throw error.response?.data || error;
    })

/// --------- Post ---------
export const callPost = (url: string, data?: any) =>
  axiosInstance({ url })
    .post(url, data)
    .then((response) => response.data)
    .catch((error) => {
      throw error.response?.data || error;
    })

/// --------- Put ---------
export const callPut = (url: string, data?: any) =>
  axiosInstance({ url })
    .put(url, data)
    .then((response) => response.data)
    .catch((error) => {
      throw error.response?.data || error;
    })

/// --------- Patch ---------
export const callPatch = (url: string, data?: any) =>
  axiosInstance({ url })
    .patch(url, data)
    .then((response) => response.data)
    .catch((error) => {
      throw error.response?.data || error;
    })

/// --------- Delete ---------
export const callDelete = (url: string, data?: any) =>
  axiosInstance({ url })
    .delete(url, data)
    .then((response) => response.data)
    .catch((error) => {
      throw error.response?.data || error;
    })