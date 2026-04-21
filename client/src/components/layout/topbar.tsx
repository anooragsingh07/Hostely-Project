"use client";

import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { UserMenu } from "./user-menu";

interface TopbarProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

/**
 * Page header. Hosts the page title, a command-palette-style search trigger,
 * and the account menu. Primary navigation lives in the sidebar.
 */
export const Topbar = ({ title, description, actions }: TopbarProps) => (
  <header className="border-border bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
    <div className="flex h-14 items-center gap-3 px-6">
      <div className="min-w-0 flex-1">
        {title && (
          <h1 className="text-foreground truncate text-sm font-semibold tracking-tight">{title}</h1>
        )}
        {description && <p className="text-muted-foreground truncate text-xs">{description}</p>}
      </div>

      <button
        type="button"
        className="border-input bg-background text-muted-foreground shadow-subtle hover:bg-accent hidden h-9 items-center gap-2 rounded-md border px-3 text-xs transition-colors duration-200 md:inline-flex"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search</span>
        <kbd className="bg-muted text-muted-foreground ml-6 rounded px-1.5 py-0.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>

      {actions}
      <NotificationBell />
      <ThemeToggle />
      <UserMenu name="Student" email="you@campus.edu" />
    </div>
  </header>
);
