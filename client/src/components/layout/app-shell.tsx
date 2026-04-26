"use client";

import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface AppShellProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * Cal.com-style application frame with a responsive sidebar:
 * - md+: fixed left rail
 * - smaller: off-canvas drawer + dimmed overlay
 */
export const AppShell = ({ title, description, actions, children }: AppShellProps) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="bg-background flex h-screen">
      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <Sidebar mobileOpen={mobileNavOpen} onNavigate={() => setMobileNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={title}
          description={description}
          actions={
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 md:hidden"
                aria-expanded={mobileNavOpen}
                aria-controls="app-sidebar"
                onClick={() => setMobileNavOpen((o) => !o)}
              >
                {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              {actions}
            </>
          }
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="container mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
