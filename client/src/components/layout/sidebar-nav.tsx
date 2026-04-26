"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import type { NavItem } from "@/lib/nav";

interface SidebarNavProps {
  pathname: string;
  items: readonly NavItem[];
  /** Close mobile drawer after navigation. */
  onItemClick?: () => void;
}

/**
 * Shared link list for desktop sidebar and mobile sheet — one source of truth
 * for active states and focus styles.
 */
export const SidebarNav = ({ pathname, items, onItemClick }: SidebarNavProps) => (
  <nav className="flex-1 overflow-y-auto px-3 py-4">
    <ul className="space-y-0.5">
      {items.map((item) => {
        const active =
          item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onItemClick}
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
);
