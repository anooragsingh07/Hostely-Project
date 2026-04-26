"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WelcomePoliciesModal } from "@/components/dashboard/welcome-policies-modal";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { H2, Muted } from "@/components/ui/typography";
import { useMe } from "@/features/auth/hooks/use-me";
import { ItemGrid } from "@/features/items/components/item-grid";
import { useItems } from "@/features/items/hooks/use-items";

/**
 * Dashboard home — a card-based feed of the freshest campus listings,
 * ranked by proximity to the viewer's hostel so the first thing they
 * see is always neighborhood-relevant.
 */
export default function DashboardPage() {
  const { user } = useMe();
  const { data, loading } = useItems({ page: 1, pageSize: 8, sortByHostel: true });
  const items = data?.items ?? [];

  return (
    <>
      <AppShell
        title="Overview"
        description="Fresh listings from your campus"
        actions={
          <Button asChild size="sm">
            <Link href="/dashboard/sell">
              List something
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      >
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <H2>Near you first</H2>
            <Muted>
              <Link
                href="/dashboard/buy"
                className="hover:text-foreground transition-colors duration-200"
              >
                Browse all →
              </Link>
            </Muted>
          </div>

          <ItemGrid
            items={items}
            loading={loading}
            emptyTitle="No listings yet"
            emptyDescription="Be the first to list something in your hostel."
            viewerHostel={user?.hostelName}
          />
        </section>
      </AppShell>
      <Suspense fallback={null}>
        <WelcomePoliciesModal />
      </Suspense>
    </>
  );
}
