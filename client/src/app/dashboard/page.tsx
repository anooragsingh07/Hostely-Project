import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { H2, H3, Muted } from "@/components/ui/typography";
import { NewListingDialog } from "@/features/listings/components/new-listing-dialog";

export const metadata = { title: "Dashboard — Hostely" };

interface Stat {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
}

const STATS: Stat[] = [
  { label: "Active listings", value: "12", delta: "+3 this week", trend: "up" },
  { label: "Open chats", value: "4", delta: "+1 today", trend: "up" },
  { label: "Pending orders", value: "2", delta: "-1 this week", trend: "down" },
  { label: "Earnings (₹)", value: "3,250", delta: "+₹450", trend: "up" },
];

interface Listing {
  title: string;
  category: string;
  price: string;
  status: "active" | "draft" | "sold";
}

const LISTINGS: Listing[] = [
  { title: "Scientific calculator", category: "Electronics", price: "₹250", status: "active" },
  { title: "DSA textbook — CLRS", category: "Books", price: "₹400", status: "active" },
  { title: "Single-speed cycle", category: "Mobility", price: "₹3,000", status: "draft" },
  { title: "Table lamp (white)", category: "Home", price: "₹150", status: "sold" },
];

const STATUS_VARIANT: Record<Listing["status"], "success" | "outline" | "default"> = {
  active: "success",
  draft: "outline",
  sold: "default",
};

export default function DashboardPage() {
  return (
    <AppShell
      title="Overview"
      description="Your campus marketplace at a glance"
      actions={<NewListingDialog />}
    >
      <section>
        <div className="grid gap-gutter grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          {STATS.map((stat) => {
            const Trend = stat.trend === "up" ? ArrowUpRight : ArrowDownRight;
            return (
              <Card key={stat.label}>
                <CardHeader className="pb-2">
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="text-3xl font-semibold tracking-tight">
                    {stat.value}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={stat.trend === "up" ? "success" : "destructive"}>
                    <Trend className="h-3 w-3" />
                    {stat.delta}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mt-section">
        <div className="flex items-baseline justify-between">
          <H2>Your listings</H2>
          <Muted>Last 30 days</Muted>
        </div>

        <Tabs defaultValue="recent" className="mt-4">
          <TabsList>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="sold">Sold</TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            <ListingsTable rows={LISTINGS.filter((l) => l.status !== "sold")} />
          </TabsContent>
          <TabsContent value="drafts">
            <ListingsTable rows={LISTINGS.filter((l) => l.status === "draft")} />
          </TabsContent>
          <TabsContent value="sold">
            <ListingsTable rows={LISTINGS.filter((l) => l.status === "sold")} />
          </TabsContent>
        </Tabs>
      </section>
    </AppShell>
  );
}

const ListingsTable = ({ rows }: { rows: Listing[] }) => {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10">
          <p className="text-center text-sm text-muted-foreground">Nothing here yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {rows.map((row) => (
            <li
              key={row.title}
              className="flex items-center justify-between gap-4 px-6 py-4 transition-colors duration-200 hover:bg-accent/50"
            >
              <div className="min-w-0">
                <H3 className="text-base">{row.title}</H3>
                <Muted className="mt-0.5">{row.category}</Muted>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
                <span className="text-sm font-medium tabular-nums">{row.price}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
