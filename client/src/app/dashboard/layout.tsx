import type { ReactNode } from "react";
import { RealtimeProvider } from "@/providers/realtime-provider";

/**
 * Route-group layout. Wraps every authenticated page in the realtime
 * provider so notifications, chat unread badges and socket listeners
 * outlive individual page navigations.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <RealtimeProvider>{children}</RealtimeProvider>;
}
