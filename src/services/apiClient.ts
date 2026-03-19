import axios, { AxiosInstance, AxiosError } from 'axios';
import type { LofnConfig, ApiError } from '../types';

/** Creates a shared Axios instance with interceptors for the Lofn API */
export function createApiClient(config: LofnConfig): AxiosInstance {
  const isDevelopment = config.debug ?? false;

  const client = axios.create({
    baseURL: config.apiUrl,
    timeout: config.timeout ?? 30000,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  });

  // Request interceptor — adds Bearer token
  client.interceptors.request.use(
    async (reqConfig) => {
      const token = config.getToken?.();
      if (token) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }

      if (isDevelopment) {
        console.log(`[LofnAPI.request]`, {
          method: reqConfig.method?.toUpperCase(),
          url: `${reqConfig.baseURL}${reqConfig.url}`,
        });
      }

      return reqConfig;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor — handles errors and 401
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const apiError: ApiError = {
        message: error.message,
        status: error.response?.status || 500,
        errors: error.response?.data as Record<string, string[]>,
      };

      if (error.response?.status === 401) {
        if (config.redirectOnUnauthorized) {
          window.location.href = config.redirectOnUnauthorized;
        }
      }

      if (config.onError) {
        config.onError(new Error(apiError.message));
      }

      return Promise.reject(apiError);
    }
  );

  return client;
}
