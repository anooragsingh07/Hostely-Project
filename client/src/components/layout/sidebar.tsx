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

/**
 * Left rail nav. Collapses on mobile via parent AppShell.
 * Keeps the topbar free of primary navigation — Cal.com pattern.
 */
export const Sidebar = () => {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { user } = useMe();
  const navItems = filterNavForRole(NAV_ITEMS, user?.role);

  return (
    <aside className="border-border bg-background flex h-full w-60 shrink-0 flex-col border-r">
      <div className="border-border flex h-14 items-center border-b px-4">
        <Link href="/dashboard" aria-label="Hostely">
          <BrandMark />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active =
              item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

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
