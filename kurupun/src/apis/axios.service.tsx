import axios from "axios";
import { environment } from "../environments";
import { store } from "../stores/store";
import { loginSuccess, logout } from "../stores/services/authSlice";

const instance = axios.create({
  baseURL: environment.API_HOST || '',
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Add request interceptor to the instance (only once)
instance.interceptors.request.use(
  (config) => {
    const { accessToken } = store.getState().auth;
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

// Add response interceptor to handle token refresh
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return instance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken } = store.getState().auth;

      if (!refreshToken) {
        store.dispatch(logout());
        return Promise.reject(error);
      }

      try {
        // Call refresh token API
        const response = await axios.post(`${environment.API_HOST}/api/auth/token/refresh/`, {
          refresh: refreshToken
        });

        const { access } = response.data;

        // Update token in store
        store.dispatch(loginSuccess({ 
          accessToken: access, 
          refreshToken: refreshToken 
        }));

        // Update authorization header
        instance.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        originalRequest.headers.Authorization = `Bearer ${access}`;

        processQueue(null, access);
        isRefreshing = false;

        // Retry original request
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

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
