"use client";

import type { Paginated, Requirement, RequirementListFilters } from "@hostely/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { requirementsApi } from "../services/requirements.api";

interface ApiError {
  message?: string;
}

export interface UseRequirementsResult {
  data: Paginated<Requirement> | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRequirements = (filters: RequirementListFilters): UseRequirementsResult => {
  const [data, setData] = useState<Paginated<Requirement> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reqIdRef = useRef(0);

  const fetchOnce = useCallback(async () => {
    const myReqId = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const page = await requirementsApi.list(filters);
      if (reqIdRef.current === myReqId) setData(page);
    } catch (e) {
      const msg = (e as ApiError).message ?? "Could not load requirements";
      if (reqIdRef.current === myReqId) setError(msg);
      toast.error(msg);
    } finally {
      if (reqIdRef.current === myReqId) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    void fetchOnce();
  }, [fetchOnce]);

  return { data, loading, error, refetch: fetchOnce };
};
