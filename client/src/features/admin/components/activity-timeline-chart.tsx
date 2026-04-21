"use client";

import type { AnalyticsTimelinePoint } from "@hostely/shared";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Formats an ISO date (YYYY-MM-DD) into a terse axis label like "Apr 15". */
const formatTick = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
};

// Recharts typings the tooltip label as ReactNode — guard before formatting.
const formatTooltipLabel = (label: unknown): string =>
  typeof label === "string" ? formatTick(label) : "";

interface ActivityTimelineChartProps {
  data: AnalyticsTimelinePoint[];
}

/**
 * 30-day stacked area of item vs. requirement creation activity.
 * Area chart (vs. line) communicates "volume" better at a glance.
 */
export const ActivityTimelineChart = ({ data }: ActivityTimelineChartProps) => {
  const hasData = data.some((p) => p.items > 0 || p.requirements > 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity (last 30 days)</CardTitle>
        <CardDescription>New listings and requirements per day.</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                <defs>
                  <linearGradient id="gradItems" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradReqs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatTick}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip
                  labelFormatter={formatTooltipLabel}
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    color: "hsl(var(--foreground))",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="items"
                  name="Items"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2}
                  fill="url(#gradItems)"
                />
                <Area
                  type="monotone"
                  dataKey="requirements"
                  name="Requirements"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  fill="url(#gradReqs)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-muted-foreground flex h-72 items-center justify-center text-sm">
            No activity yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
