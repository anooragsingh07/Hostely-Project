/** Single place that reads NEXT_PUBLIC_* — keeps runtime reads centralized. */
export const clientEnv = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1",
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000",
} as const;
