"use client";

import type { PublicUser } from "@hostely/shared";
import { useEffect, useState } from "react";
import { authApi } from "../services/auth.api";

interface UseMeResult {
  user: PublicUser | null;
  loading: boolean;
}

/**
 * Hydrates the current user from `/auth/me` via the session cookie.
 * Used by pages that branch UI on ownership (delete buttons, mine-only flows).
 */
export const useMe = (): UseMeResult => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading };
};
