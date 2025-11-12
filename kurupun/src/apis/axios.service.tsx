import axios from 'axios';
import { environment } from '../environments';
const API_HOST = environment.API_HOST;
export const instance = axios.create({
  baseURL: API_HOST,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface IAxiosService {
  url: string;
  headers?: Record<string, string>;
  token?: string;
}

export const axiosService = (config: IAxiosService) => {
  const token =
    config.token ?? localStorage.getItem('accessToken') ??
    '';

  if (config.headers) {
    // apply custom headers to the instance
    instance.defaults.headers = {
      ...instance.defaults.headers,
      ...config.headers,
    };
  }

  if (token) {
    // attach Bearer token to common Authorization header
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // ensure Authorization removed if no token
    if (instance.defaults.headers?.common) {
      const { Authorization, ...rest } = instance.defaults.headers.common as Record<string, any>;
      instance.defaults.headers.common = rest;
    }
  }

  return instance;
};