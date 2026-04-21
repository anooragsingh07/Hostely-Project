import axios, { AxiosError, type AxiosInstance } from "axios";
import { clientEnv } from "./env";

const TOKEN_KEY = "hostely.token";

export const tokenStore = {
  get: (): string | null =>
    typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => {
    if (typeof window !== "undefined") window.localStorage.setItem(TOKEN_KEY, token);
  },
  clear: (): void => {
    if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
  },
};

/**
 * Single axios instance. Interceptors handle auth + error normalization
 * so feature code deals in plain `{ data }` shapes only.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: clientEnv.apiUrl,
  withCredentials: true,
  timeout: 15_000,
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
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
