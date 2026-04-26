"use client";

import { useMemo, useState } from "react";
import type { ItemListFilters } from "@hostely/shared";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Muted } from "@/components/ui/typography";
import { useMe } from "@/features/auth/hooks/use-me";
import { ItemFilters, type ItemFilterValues } from "@/features/items/components/item-filters";
import { ItemGrid } from "@/features/items/components/item-grid";
import { useItems } from "@/features/items/hooks/use-items";

const PAGE_SIZE = 12;

const initialFilters: ItemFilterValues = {
  q: "",
  category: "",
  hostelName: "",
  sortByHostel: false,
};

/**
 * Marketplace browse surface. Filters are local state; each change
 * triggers a new request keyed by the JSON shape of the filter set.
 */
export default function BuyPage() {
  const [filters, setFilters] = useState<ItemFilterValues>(initialFilters);
  const [page, setPage] = useState(1);
  const { user } = useMe();

  const query = useMemo<ItemListFilters>(
    () => ({
      q: filters.q.trim() || undefined,
      category: filters.category || undefined,
      hostelName: filters.hostelName.trim() || undefined,
      sortByHostel: filters.sortByHostel || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [filters, page],
  );

  const { data, loading } = useItems(query);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const updateFilters = (next: ItemFilterValues) => {
    setFilters(next);
    setPage(1);
  };

  return (
    <AppShell title="Buy" description="Everything on sale across your campus">
      <div className="space-y-6">
        <ItemFilters
          value={filters}
          onChange={updateFilters}
          onReset={() => updateFilters(initialFilters)}
          viewerHostelName={user?.hostelName}
        />

        <div className="flex items-center justify-between">
          <Muted>{loading ? "Loading…" : `${total} listing${total === 1 ? "" : "s"} found`}</Muted>
        </div>

        <ItemGrid
          items={data?.items ?? []}
          loading={loading}
          emptyTitle="No matches"
          emptyDescription="Try a different search or clear filters."
          viewerHostel={user?.hostelName}
        />

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-muted-foreground text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
