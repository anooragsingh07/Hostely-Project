import type { AnalyticsSnapshot } from "@hostely/shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const VARIANT_BY_STATUS: Record<string, "default" | "success" | "warning" | "destructive"> = {
  active: "success",
  sold: "default",
  withdrawn: "warning",
  removed: "destructive",
};

/** Lightweight status breakdown — a table is plenty for 4 rows. */
export const StatusBreakdown = ({ data }: { data: AnalyticsSnapshot["itemsByStatus"] }) => {
  const total = data.reduce((sum, row) => sum + row.count, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Items by status</CardTitle>
        <CardDescription>Lifecycle breakdown of every listing ever created.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-border divide-y">
          {data.map((row) => {
            const pct = total === 0 ? 0 : Math.round((row.count / total) * 100);
            return (
              <li key={row.label} className="flex items-center justify-between py-3 text-sm">
                <Badge variant={VARIANT_BY_STATUS[row.label] ?? "default"} className="capitalize">
                  {row.label}
                </Badge>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground text-xs tabular-nums">{pct}%</span>
                  <span className="font-medium tabular-nums">{row.count}</span>
                </div>
              </li>
            );
          })}
          {data.length === 0 && (
            <li className="text-muted-foreground py-3 text-sm">No data yet.</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};
