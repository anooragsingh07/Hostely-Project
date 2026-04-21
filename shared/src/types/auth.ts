import type { PublicUser } from "./user";

export interface AuthResponse {
  token: string;
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
