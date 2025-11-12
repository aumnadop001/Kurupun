import axios from "axios";
import { environment } from "../environments";
import { store } from "../stores/store";

const instance = axios.create({
  baseURL: environment.API_HOST || '',
});

// Add request interceptor to the instance (only once)
instance.interceptors.request.use(
  (config) => {
    const { accessToken } = store.getState().auth;
    console.log('call api',accessToken);
    
    if (accessToken) {
      // config.headers.auth = accessToken;
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;

interface IAxiosService {
  url: string;
  headers?: any;
}

export const axiosService = (config: IAxiosService) => {
  // Configure additional headers if provided
  if (config.headers) {
    Object.keys(config.headers).forEach(key => {
      instance.defaults.headers.common[key] = config.headers[key];
    });
  }

  return instance;
};
