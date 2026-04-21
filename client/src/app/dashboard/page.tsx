import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Dashboard — Hostely" };

const QUICK_LINKS = [
  {
    title: "Post a listing",
    description: "Sell books, gadgets, cycles, and more to your hostel.",
    href: "/dashboard/listings",
    cta: "Create listing",
  },
  {
    title: "Open chats",
    description: "Reply to buyers and sellers in real time.",
    href: "/dashboard/chat",
    cta: "Go to chat",
  },
  {
    title: "Your orders",
    description: "Track pickups, handovers, and payments.",
    href: "/dashboard/orders",
    cta: "View orders",
  },
] as const;

export default function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      description="Your campus marketplace at a glance"
      actions={
        <Button asChild size="sm">
          <Link href="/dashboard/listings">New listing</Link>
        </Button>
      }
    >
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {QUICK_LINKS.map((item) => (
          <Card key={item.href} className="transition-shadow duration-200 hover:shadow-card">
            <CardHeader>
              <CardTitle className="text-base">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" size="sm" asChild className="-ml-3">
                <Link href={item.href}>
                  {item.cta}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold tracking-tight">Recent activity</h2>
        <Card className="mt-3">
          <CardContent className="py-10">
            <p className="text-center text-sm text-muted-foreground">
              No activity yet. Your recent listings, chats, and orders will appear here.
            </p>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
