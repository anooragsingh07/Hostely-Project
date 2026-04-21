import type { AuthResponse, PublicUser, SignInCredentials, SignUpCredentials } from "@hostely/shared";
import { apiClient } from "@/lib/api-client";

/**
 * Auth API surface.
 *
 * Authentication is cookie-based: the server sets an HTTP-only
 * session cookie on register/login and clears it on logout.
 * No token is read or stored by JavaScript.
 */
export const authApi = {
  register: async (values: SignUpCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<{ data: AuthResponse }>("/auth/register", values);
    return data.data;
  },
  login: async (values: SignInCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<{ data: AuthResponse }>("/auth/login", values);
    return data.data;
  },
  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },
  me: async (): Promise<PublicUser> => {
    const { data } = await apiClient.get<{ data: { user: PublicUser } }>("/auth/me");
    return data.data.user;
  },
};
