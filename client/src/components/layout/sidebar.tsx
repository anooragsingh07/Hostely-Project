"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useMe } from "@/features/auth/hooks/use-me";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, filterNavForRole } from "@/lib/nav";
import { SidebarNav } from "./sidebar-nav";

interface SidebarProps {
  /** When false on small screens, sidebar is off-canvas. Always visible from md. */
  mobileOpen?: boolean;
  onNavigate?: () => void;
}

/**
 * Left rail nav. On viewports below `md`, visibility is controlled by
 * `mobileOpen` from `AppShell`; from `md` up the rail is always shown.
 */
export const Sidebar = ({ mobileOpen = false, onNavigate }: SidebarProps) => {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { user } = useMe();
  const navItems = filterNavForRole(NAV_ITEMS, user?.role);

  return (
    <aside
      id="app-sidebar"
      className={cn(
        "border-border bg-background flex h-full w-60 shrink-0 flex-col border-r",
        "fixed inset-y-0 left-0 z-40 md:static md:z-auto",
        "transition-transform duration-200 ease-out md:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      )}
    >
      <div className="border-border flex h-14 items-center border-b px-4">
        <Link href="/dashboard" aria-label="Hostely" onClick={onNavigate}>
          <BrandMark />
        </Link>
      </div>

      <SidebarNav pathname={pathname} items={navItems} onItemClick={onNavigate} />

      <div className="border-border border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            void signOut();
          }}
          className="text-muted-foreground hover:text-foreground w-full justify-start"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
};
