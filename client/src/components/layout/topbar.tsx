"use client";

import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
  <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
    <div className="flex h-14 items-center gap-3 px-6">
      <div className="min-w-0 flex-1">
        {title && (
          <h1 className="truncate text-sm font-semibold tracking-tight text-foreground">
            {title}
          </h1>
        )}
        {description && (
          <p className="truncate text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      <button
        type="button"
        className="hidden h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-xs text-muted-foreground shadow-subtle transition-colors duration-200 hover:bg-accent md:inline-flex"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search</span>
        <kbd className="ml-6 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      {actions}
      <ThemeToggle />
      <UserMenu name="Student" email="you@campus.edu" />
    </div>
  </header>
);
