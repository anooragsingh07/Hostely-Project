import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface AppShellProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * Cal.com-style application frame:
 *   [ sidebar ]  [ topbar       ]
 *                [ content area ]
 *
 * The sidebar persists across routes; the topbar adapts per page.
 */
export const AppShell = ({ title, description, actions, children }: AppShellProps) => (
  <div className="flex h-screen bg-background">
    <Sidebar />
    <div className="flex min-w-0 flex-1 flex-col">
      <Topbar title={title} description={description} actions={actions} />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  </div>
);
