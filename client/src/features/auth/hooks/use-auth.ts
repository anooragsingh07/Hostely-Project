"use client";

import type { AuthResponse } from "@hostely/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authApi } from "../services/auth.api";
import type { SignInValues, SignUpValues } from "../schemas/auth.schema";

interface ApiError {
  code?: string;
  message?: string;
}

/**
 * Encapsulates auth side-effects: redirect, toasts, server-side logout.
 * Session is managed entirely by the HTTP-only cookie — nothing is
 * persisted on the client.
 */
export const useAuth = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSuccess = (res: AuthResponse, greeting: string): void => {
    toast.success(`${greeting}, ${res.user.name.split(" ")[0]}`);
    router.push("/dashboard");
    router.refresh();
  };

  const signUp = async (values: SignUpValues): Promise<void> => {
    setSubmitting(true);
    try {
      const res = await authApi.register(values);
      handleSuccess(res, "Welcome");
    } catch (e) {
      toast.error((e as ApiError).message ?? "Could not create account");
    } finally {
      setSubmitting(false);
    }
  };

  const signIn = async (values: SignInValues): Promise<void> => {
    setSubmitting(true);
    try {
      const res = await authApi.login(values);
      handleSuccess(res, "Welcome back");
    } catch (e) {
      toast.error((e as ApiError).message ?? "Could not sign in");
    } finally {
      setSubmitting(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // Best-effort — the middleware will redirect on next navigation anyway.
    }
    router.push("/sign-in");
    router.refresh();
  };

  return { submitting, signUp, signIn, signOut };
};
