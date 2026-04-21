import type { ReactNode } from "react";

/**
 * Route-group layout. The AppShell is rendered per-page so each route
 * can declare its own title/description/actions for the topbar.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
