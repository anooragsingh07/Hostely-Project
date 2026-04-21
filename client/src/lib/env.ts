import { parseEmailDomains } from "@hostely/shared";

/** Single place that reads NEXT_PUBLIC_* — keeps runtime reads centralized. */
export const clientEnv = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1",
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000",
  /**
   * Optional mirror of the server's accepted email domains.
   * When empty, client-side validation skips the domain check and
   * relies on the server's response for correctness.
   */
  collegeEmailDomains: parseEmailDomains(process.env.NEXT_PUBLIC_COLLEGE_EMAIL_DOMAINS),
} as const;
