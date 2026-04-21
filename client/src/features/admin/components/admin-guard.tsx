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
 * Client-side admin gate. The API already enforces role on every request,
 * but this component avoids flashing admin UI to a student — and bounces
 * them back to the dashboard with a polite URL change.
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
