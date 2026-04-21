import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata = { title: "Dashboard — Hostely" };

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="container flex h-14 items-center justify-between">
          <BrandMark />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link href="/sign-in">Sign out</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to Hostely</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Marketplace modules (listings, chat, orders) mount here next.
        </p>
      </main>
    </div>
  );
}
