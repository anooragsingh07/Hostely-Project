import type { AnalyticsSnapshot } from "@hostely/shared";
import { Boxes, CheckCircle2, MessageSquareWarning, Shield, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KpiRow {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: string;
}

/**
 * Top-of-page summary strip. Matches the Cal.com pattern of a single row
 * of terse metrics feeding the eye to the deeper breakdowns below.
 */
export const AnalyticsKpis = ({ totals }: { totals: AnalyticsSnapshot["totals"] }) => {
  const rows: KpiRow[] = [
    { label: "Total items", value: totals.items, icon: Boxes, accent: "text-foreground" },
    { label: "Active", value: totals.activeItems, icon: CheckCircle2, accent: "text-success" },
    { label: "Removed", value: totals.removedItems, icon: Shield, accent: "text-destructive" },
    {
      label: "Requirements",
      value: totals.requirements,
      icon: MessageSquareWarning,
      accent: "text-foreground",
    },
    { label: "Users", value: totals.users, icon: Users, accent: "text-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {rows.map(({ label, value, icon: Icon, accent }) => (
        <Card key={label}>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                {label}
              </div>
              <div className={`mt-1 text-2xl font-semibold ${accent}`}>
                {value.toLocaleString()}
              </div>
            </div>
            <Icon className={`h-5 w-5 ${accent}`} aria-hidden />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
