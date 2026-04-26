"use client";

import type { AuthResponse } from "@hostely/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/error-message";
import { authApi } from "../services/auth.api";
import type { SignInValues, SignUpValues } from "../schemas/auth.schema";

/**
 * Encapsulates auth side-effects: redirect, toasts, server-side logout.
 * Session is managed entirely by the HTTP-only cookie — nothing is
 * persisted on the client.
 */
export const useAuth = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSuccess = (res: AuthResponse, greeting: string, path = "/dashboard"): void => {
    toast.success(`${greeting}, ${res.user.name.split(" ")[0]}`);
    router.push(path);
    router.refresh();
  };

  const signUp = async (values: SignUpValues): Promise<void> => {
    setSubmitting(true);
    try {
      const res = await authApi.register(values);
      handleSuccess(res, "Welcome", "/dashboard?welcome=1");
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not create account"));
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
      toast.error(getApiErrorMessage(e, "Could not sign in"));
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
