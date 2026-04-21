"use client";

import type { Item, ItemStatus, Paginated } from "@hostely/shared";
import { ITEM_STATUSES } from "@hostely/shared";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Search,
  ShieldOff,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AdminGuard } from "@/features/admin/components/admin-guard";
import { adminApi } from "@/features/admin/services/admin.api";

interface ApiError {
  message?: string;
}

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  ...ITEM_STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })),
];

const BADGE_BY_STATUS: Record<ItemStatus, "default" | "success" | "warning" | "destructive"> = {
  active: "success",
  sold: "default",
  withdrawn: "warning",
  removed: "destructive",
};

/** Handy, simple pager — moderation volume should be low enough for this. */
export default function AdminModerationPage() {
  const [data, setData] = useState<Paginated<Item> | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ItemStatus | "">("");
  const [q, setQ] = useState("");
  const [qDraft, setQDraft] = useState("");

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await adminApi.listItems({
        page,
        pageSize: PAGE_SIZE,
        status: status === "" ? undefined : status,
        q: q || undefined,
      });
      setData(res);
    } catch (err) {
      toast.error((err as ApiError).message ?? "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, [page, status, q]);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (item: Item): Promise<void> => {
    if (!window.confirm(`Remove "${item.title}" from public feeds?`)) return;
    setMutating(item.id);
    try {
      await adminApi.removeItem(item.id);
      toast.success("Listing removed");
      await load();
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't remove listing");
    } finally {
      setMutating(null);
    }
  };

  const restore = async (item: Item): Promise<void> => {
    setMutating(item.id);
    try {
      await adminApi.restoreItem(item.id);
      toast.success("Listing restored");
      await load();
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't restore listing");
    } finally {
      setMutating(null);
    }
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <AdminGuard
      title="Moderation"
      description="Review reported or suspicious listings. Removed items stay visible to their owner as tombstones."
    >
      <Card>
        <CardHeader className="gap-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Listings</CardTitle>
              <CardDescription>
                Search by title/description; filter by lifecycle status.
              </CardDescription>
            </div>
          </div>
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setQ(qDraft.trim());
            }}
          >
            <div className="relative flex-1">
              <Search
                className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                aria-hidden
              />
              <Input
                value={qDraft}
                onChange={(e) => setQDraft(e.target.value)}
                placeholder="Search listings"
                className="pl-9"
                aria-label="Search"
              />
            </div>
            <div className="sm:w-48">
              <Select
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value as ItemStatus | "");
                }}
                options={STATUS_OPTIONS}
                aria-label="Filter by status"
              />
            </div>
            <Button type="submit" variant="outline">
              Apply
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          {loading && !data ? (
            <div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
              Loading…
            </div>
          ) : (data?.items.length ?? 0) === 0 ? (
            <div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
              No listings match this filter.
            </div>
          ) : (
            <ul className="divide-border divide-y">
              {data?.items.map((item) => {
                const isRemoved = item.status === "removed";
                return (
                  <li key={item.id} className="flex items-start justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/dashboard/items/${item.id}`}
                          className="hover:text-foreground text-sm font-medium"
                        >
                          {item.title}
                        </Link>
                        <Badge
                          variant={BADGE_BY_STATUS[item.status] ?? "default"}
                          className="capitalize"
                        >
                          {item.status}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {item.category}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                        {item.description}
                      </div>
                      <div className="text-muted-foreground mt-1 text-xs">
                        {item.author.name} · {item.hostelName} · ₹{item.price.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/dashboard/items/${item.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      {isRemoved ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={mutating === item.id}
                          onClick={() => void restore(item)}
                        >
                          <RotateCcw className="h-4 w-4" />
                          Restore
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={mutating === item.id}
                          onClick={() => void remove(item)}
                        >
                          <ShieldOff className="h-4 w-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {data && data.total > 0 && (
            <div className="text-muted-foreground mt-4 flex items-center justify-between text-xs">
              <span>
                Page {data.page} of {totalPages} · {data.total} total
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminGuard>
  );
}
