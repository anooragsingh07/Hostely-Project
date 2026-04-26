"use client";

import { ROLES } from "@hostely/shared";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useMe } from "@/features/auth/hooks/use-me";

interface AdminGuardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * Client-side admin gate for UX only (hide admin chrome, avoid flash of restricted content).
 * `/api/v1/admin/*` rejects non-admins with 403 regardless of anything done in the browser console.
 */
export const AdminGuard = ({ title, description, actions, children }: AdminGuardProps) => {
  const router = useRouter();
  const { user, loading } = useMe();

  useEffect(() => {
    if (!loading && user && user.role !== ROLES.ADMIN) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <AppShell title={title} description={description} actions={actions}>
        <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
          Loading…
        </div>
      </AppShell>
    );
  }

  if (!user || user.role !== ROLES.ADMIN) {
    return (
      <AppShell title={title} description={description} actions={actions}>
        <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
          This area is restricted.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={title} description={description} actions={actions}>
      {children}
    </AppShell>
  );
};
