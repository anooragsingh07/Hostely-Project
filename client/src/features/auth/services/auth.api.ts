import type { AuthResponse, PublicUser, SignInCredentials, SignUpCredentials } from "@hostely/shared";
import { apiClient } from "@/lib/api-client";

/** Thin API surface — caller is a hook, not a component. */
export const authApi = {
  register: async (values: SignUpCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<{ data: AuthResponse }>("/auth/register", values);
    return data.data;
  },
  login: async (values: SignInCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<{ data: AuthResponse }>("/auth/login", values);
    return data.data;
  },
  me: async (): Promise<PublicUser> => {
    const { data } = await apiClient.get<{ data: { user: PublicUser } }>("/auth/me");
    return data.data.user;
  },
};
