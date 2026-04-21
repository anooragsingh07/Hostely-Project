"use client";

import type { AnalyticsSnapshot } from "@hostely/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { adminApi } from "../services/admin.api";

interface UseAnalyticsResult {
  data: AnalyticsSnapshot | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/** Fetches the admin analytics snapshot on mount and exposes a refresh hook. */
export const useAnalytics = (): UseAnalyticsResult => {
  const [data, setData] = useState<AnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await adminApi.analytics();
      if (mounted.current) setData(snapshot);
    } catch (err) {
      if (mounted.current) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, refresh: load };
};
