"use client";

import { RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/features/admin/components/admin-guard";
import { AnalyticsKpis } from "@/features/admin/components/analytics-kpis";
import { StatusBreakdown } from "@/features/admin/components/status-breakdown";
import { useAnalytics } from "@/features/admin/hooks/use-analytics";

const ChartSlot = () => <div className="bg-muted h-72 animate-pulse rounded-xl" />;

const ActivityTimelineChart = dynamic(
  () =>
    import("@/features/admin/components/activity-timeline-chart").then((m) => ({
      default: m.ActivityTimelineChart,
    })),
  { loading: () => <ChartSlot />, ssr: false },
);

const CategoryPopularityChart = dynamic(
  () =>
    import("@/features/admin/components/category-popularity-chart").then((m) => ({
      default: m.CategoryPopularityChart,
    })),
  { loading: () => <ChartSlot />, ssr: false },
);

const HostelBreakdownChart = dynamic(
  () =>
    import("@/features/admin/components/hostel-breakdown-chart").then((m) => ({
      default: m.HostelBreakdownChart,
    })),
  { loading: () => <ChartSlot />, ssr: false },
);

/**
 * Admin analytics dashboard. Cal.com-style Overview: KPI strip,
 * activity trend, two side-by-side breakdowns, status table.
 */
export default function AdminDashboardPage() {
  const { data, loading, error, refresh } = useAnalytics();

  return (
    <AdminGuard
      title="Admin overview"
      description="Marketplace health across items, requirements, and moderation."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/admin/users">Users</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/admin/requirements">Requirements</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/admin/categories">Categories</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/admin/moderation">Listings</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/admin/content">Chat & comments</Link>
          </Button>
          <Button
            size="sm"
            onClick={() => {
              void refresh();
            }}
            disabled={loading}
          >
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Refresh
          </Button>
        </div>
      }
    >
      {error && (
        <div className="border-destructive/40 bg-destructive/10 text-destructive mb-6 rounded-lg border px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading && !data ? (
        <DashboardSkeleton />
      ) : data ? (
        <div className="space-y-6">
          <AnalyticsKpis totals={data.totals} />

          <ActivityTimelineChart data={data.timeline} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CategoryPopularityChart
              data={data.itemsByCategory}
              title="Items by category"
              description="Sale listings grouped by category."
            />
            <CategoryPopularityChart
              data={data.requirementsByCategory}
              title="Requirements by category"
              description="Buy requests grouped by category."
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
            <HostelBreakdownChart data={data.itemsByHostel} />
            <StatusBreakdown data={data.itemsByStatus} />
          </div>

          <p className="text-muted-foreground text-right text-xs">
            Generated {new Date(data.generatedAt).toLocaleString()}
          </p>
        </div>
      ) : null}
    </AdminGuard>
  );
}

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-muted h-24 animate-pulse rounded-xl" />
      ))}
    </div>
    <div className="bg-muted h-72 animate-pulse rounded-xl" />
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="bg-muted h-72 animate-pulse rounded-xl" />
      <div className="bg-muted h-72 animate-pulse rounded-xl" />
    </div>
  </div>
);
