import type { ApiError } from "./api-client";

/**
 * Normalizes rejected API errors (and unknown throws) for toast / inline copy.
 * Axios interceptor already maps responses to `ApiError`.
 */
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as ApiError).message;
    if (typeof msg === "string" && msg.length > 0) return msg;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};
