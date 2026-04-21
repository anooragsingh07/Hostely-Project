"use client";

import type { Category } from "@hostely/shared";
import { ITEM_CATEGORIES } from "@hostely/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { categoriesApi } from "../services/categories.api";

/** Fallback used while the first fetch is in-flight — keeps forms rendering. */
const SEED_FALLBACK: Category[] = ITEM_CATEGORIES.map((slug, idx) => ({
  id: `seed-${idx}`,
  slug,
  label: slug.charAt(0).toUpperCase() + slug.slice(1),
  active: true,
  seeded: true,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
}));

/**
 * Process-wide cache — the category list is small, shared, and rarely
 * changes, so a simple in-memory singleton beats wiring a full fetcher.
 * Subscribers are notified on invalidation so moderator changes appear
 * instantly across every open dropdown.
 */
let cache: Category[] | null = null;
let inflight: Promise<Category[]> | null = null;
const listeners = new Set<(next: Category[]) => void>();

const notify = (next: Category[]): void => {
  cache = next;
  listeners.forEach((l) => l(next));
};

const fetchOnce = async (): Promise<Category[]> => {
  if (cache) return cache;
  if (!inflight) {
    inflight = categoriesApi
      .list()
      .then((list) => {
        notify(list);
        return list;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
};

export interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  /** Imperatively inject a new/updated list — used after admin mutations. */
  setCategories: (next: Category[]) => void;
}

export const useCategories = (): UseCategoriesResult => {
  const [categories, setCategoriesState] = useState<Category[]>(() => cache ?? SEED_FALLBACK);
  const [loading, setLoading] = useState<boolean>(() => cache === null);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const listener = (next: Category[]): void => {
      if (mounted.current) setCategoriesState(next);
    };
    listeners.add(listener);

    if (cache === null) {
      fetchOnce()
        .catch((err: unknown) => {
          if (mounted.current) {
            setError(err instanceof Error ? err.message : "Failed to load categories");
          }
        })
        .finally(() => {
          if (mounted.current) setLoading(false);
        });
    } else {
      setLoading(false);
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    cache = null;
    setLoading(true);
    try {
      const next = await fetchOnce();
      notify(next);
    } catch (err) {
      if (mounted.current) {
        setError(err instanceof Error ? err.message : "Failed to load categories");
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  const setCategories = useCallback((next: Category[]): void => {
    notify(next);
  }, []);

  return { categories, loading, error, refresh, setCategories };
};
