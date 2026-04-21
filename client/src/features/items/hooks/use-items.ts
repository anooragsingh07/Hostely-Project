"use client";

import type { Item, ItemListFilters, Paginated } from "@hostely/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { itemsApi } from "../services/items.api";

interface ApiError {
  message?: string;
}

interface UseItemsResult {
  data: Paginated<Item> | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Fetches items whenever `filters` changes, skipping stale responses if
 * the filter object changes while a request is in flight.
 */
export const useItems = (filters: ItemListFilters): UseItemsResult => {
  const [data, setData] = useState<Paginated<Item> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reqIdRef = useRef(0);

  const fetchOnce = useCallback(async () => {
    const myReqId = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const page = await itemsApi.list(filters);
      if (reqIdRef.current === myReqId) setData(page);
    } catch (e) {
      const msg = (e as ApiError).message ?? "Could not load listings";
      if (reqIdRef.current === myReqId) setError(msg);
      toast.error(msg);
    } finally {
      if (reqIdRef.current === myReqId) setLoading(false);
    }
    // Stringify filters so referential changes don't trigger needless fetches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    void fetchOnce();
  }, [fetchOnce]);

  return { data, loading, error, refetch: fetchOnce };
};
