"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { tokenStore } from "@/lib/api-client";
import type { SignInValues, SignUpValues } from "../schemas/auth.schema";
import { authApi, type AuthResponse } from "../services/auth.api";

interface ApiError {
  code?: string;
  message?: string;
}

/**
 * Encapsulates auth side-effects: token persistence, redirect, toasts.
 * Components remain declarative.
 */
export const useAuth = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSuccess = (res: AuthResponse, greeting: string): void => {
    tokenStore.set(res.token);
    toast.success(`${greeting}, ${res.user.name.split(" ")[0]}`);
    router.push("/dashboard");
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

  const signOut = (): void => {
    tokenStore.clear();
    router.push("/sign-in");
  };

  return { submitting, signUp, signIn, signOut };
};
