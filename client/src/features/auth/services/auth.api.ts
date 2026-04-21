import { apiClient } from "@/lib/api-client";
import type { SignInValues, SignUpValues } from "../schemas/auth.schema";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  department: string;
  hostelName: string;
  role: "student" | "admin";
  avatarUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

/** Thin API surface — caller is a hook, not a component. */
export const authApi = {
  register: async (values: SignUpValues): Promise<AuthResponse> => {
    const { data } = await apiClient.post<{ data: AuthResponse }>("/auth/register", values);
    return data.data;
  },
  login: async (values: SignInValues): Promise<AuthResponse> => {
    const { data } = await apiClient.post<{ data: AuthResponse }>("/auth/login", values);
    return data.data;
  },
  me: async (): Promise<AuthUser> => {
    const { data } = await apiClient.get<{ data: { user: AuthUser } }>("/auth/me");
    return data.data.user;
  },
};
