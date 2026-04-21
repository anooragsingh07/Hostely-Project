import type { PublicUser } from "./user";

/**
 * The HTTP-only session cookie is the source of truth for auth;
 * the response body only needs to hydrate the UI.
 */
export interface AuthResponse {
  user: PublicUser;
}

export interface SignInCredentials {
  email: string;
  rollNo: string;
  department: string;
  hostelName: string;
  password: string;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  rollNo: string;
  department: string;
  hostelName: string;
  password: string;
}
