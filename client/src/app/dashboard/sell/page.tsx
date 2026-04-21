"use client";

import { useCallback } from "react";
import { Store, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { H3, Muted } from "@/components/ui/typography";
import { ListingForm } from "@/features/items/components/listing-form";
import { useItems } from "@/features/items/hooks/use-items";
import { itemsApi } from "@/features/items/services/items.api";
import { formatPrice, formatRelative } from "@/lib/format";

interface ApiError {
  message?: string;
}

/**
 * Selling surface — post a new listing on the left, review your own on the right.
 * `mine=true` scopes the list endpoint to the current user (server-side).
 */
export default function SellPage() {
  const { data, loading, refetch } = useItems({
    mine: true,
    page: 1,
    pageSize: 25,
  });

  const items = data?.items ?? [];

  const onCreated = useCallback(() => {
    void refetch();
  }, [refetch]);

  const onDelete = useCallback(
    async (id: string) => {
      if (!window.confirm("Delete this listing?")) return;
      try {
        await itemsApi.remove(id);
        toast.success("Listing removed");
        void refetch();
      } catch (e) {
        toast.error((e as ApiError).message ?? "Could not delete listing");
      }
    },
    [refetch],
  );

  return (
    <AppShell title="Sell" description="Post a new listing for your hostel">
      <div className="gap-gutter grid grid-cols-1 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>New listing</CardTitle>
              <CardDescription>Everything here is visible to campus peers.</CardDescription>
            </CardHeader>
            <CardContent>
              <ListingForm onCreated={onCreated} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="mb-3 flex items-baseline justify-between">
            <H3>Your listings</H3>
            <Muted>{items.length}</Muted>
          </div>

          {loading && <MyListingsSkeleton />}

          {!loading && items.length === 0 && (
            <EmptyState
              icon={Store}
              title="Nothing listed yet"
              description="Your published items will appear here."
            />
          )}

          {!loading && items.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <ul className="divide-border divide-y">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
                          <Badge variant="outline" className="capitalize">
                            {item.status}
                          </Badge>
                          <span className="tabular-nums">{formatPrice(item.price)}</span>
                          <span>·</span>
                          <span>{formatRelative(item.createdAt)}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${item.title}`}
                        onClick={() => void onDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}

const MyListingsSkeleton = () => (
  <Card>
    <CardContent className="space-y-3 p-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      ))}
    </CardContent>
  </Card>
);
