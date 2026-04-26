import axios, { type AxiosInstance } from "axios";
import type { AxiosError } from "axios";
import { clientEnv } from "./env";

/**
 * Single axios instance. `withCredentials: true` ensures the browser
 * sends the HTTP-only session cookie on every request — no token juggling
 * in JavaScript, reducing XSS exposure.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: clientEnv.apiUrl,
  withCredentials: true,
  timeout: 15_000,
});

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ error?: ApiError }>) => {
    const apiError: ApiError = error.response?.data?.error ?? {
      code: "NETWORK_ERROR",
      message: error.message || "Network error",
    };
    return Promise.reject(apiError);
  },
);
