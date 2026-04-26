"use client";

import { useCallback } from "react";
import { MessagesSquare } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { H3, Muted } from "@/components/ui/typography";
import { RequirementCard } from "@/features/requirements/components/requirement-card";
import { RequirementForm } from "@/features/requirements/components/requirement-form";
import { useRequirements } from "@/features/requirements/hooks/use-requirements";
import { requirementsApi } from "@/features/requirements/services/requirements.api";
import { useMe } from "@/features/auth/hooks/use-me";
import { getApiErrorMessage } from "@/lib/error-message";

/**
 * Requirements board — opposite side of the marketplace.
 * Left: post a "wanted". Right: the latest open posts across campus.
 */
export default function RequirementsPage() {
  const { data, loading, refetch } = useRequirements({ page: 1, pageSize: 20 });
  const { user } = useMe();
  const requirements = data?.items ?? [];

  const onDelete = useCallback(
    async (id: string) => {
      if (!window.confirm("Delete this requirement?")) return;
      try {
        await requirementsApi.remove(id);
        toast.success("Requirement removed");
        void refetch();
      } catch (e) {
        toast.error(getApiErrorMessage(e, "Could not delete requirement"));
      }
    },
    [refetch],
  );

  return (
    <AppShell
      title="Requirements"
      description="Post what you're looking for — neighbors will know."
    >
      <div className="gap-gutter grid grid-cols-1 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Post a requirement</CardTitle>
              <CardDescription>Describe what you need in a sentence or two.</CardDescription>
            </CardHeader>
            <CardContent>
              <RequirementForm onCreated={() => void refetch()} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3 lg:col-span-3">
          <div className="flex items-baseline justify-between">
            <H3>Open requirements</H3>
            <Muted>{requirements.length}</Muted>
          </div>

          {loading && <RequirementListSkeleton />}

          {!loading && requirements.length === 0 && (
            <EmptyState
              icon={MessagesSquare}
              title="No open requirements"
              description="Be the first to ask — odds are somebody has one to spare."
            />
          )}

          {!loading && requirements.length > 0 && (
            <div className="space-y-3">
              {requirements.map((r) => (
                <RequirementCard
                  key={r.id}
                  requirement={r}
                  canDelete={user?.id === r.author.id}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

const RequirementListSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i}>
        <CardContent className="space-y-2 p-5">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </CardContent>
      </Card>
    ))}
  </div>
);
