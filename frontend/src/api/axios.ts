import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Load base URL from Vite environment variables (fallback to localhost:8000 if not set)
const apiBaseURL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

// Create a configured Axios instance
export const apiInstance: AxiosInstance = axios.create({
  baseURL: apiBaseURL,
  timeout: 30000, // 30 seconds timeout limit
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Configure Request Interceptor
apiInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Log every request outgoing to the console for trace audits
    console.log(`[API Request Outbound] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
      params: config.params,
      data: config.data,
    });
    return config;
  },
  (error: any) => {
    console.error('[API Request Error] Outbound request failure:', error);
    return Promise.reject(error);
  }
);

// Configure Response Interceptor
apiInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return response directly for easy consumer access
    return response;
  },
  (error: any) => {
    // Console error logger for backend developer debugging
    if (error.response) {
      console.error(
        `[API Response Error] Server failed with HTTP status ${error.response.status}`,
        {
          url: error.config?.url,
          status: error.response.status,
          data: error.response.data,
        }
      );
    } else if (error.request) {
      console.error('[API Response Error] No response was returned by the network request:', error.request);
    } else {
      console.error('[API Client Error] Failed to execute network handshake:', error.message);
    }
    
    return Promise.reject(error);
  }
);
export default apiInstance;
