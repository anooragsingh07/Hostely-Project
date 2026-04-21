import { Home, MessagesSquare, ShoppingBag, Store, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Primary product surfaces. Order reflects the user's mental model. */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Buy", href: "/dashboard/buy", icon: ShoppingBag },
  { label: "Sell", href: "/dashboard/sell", icon: Store },
  { label: "Requirements", href: "/dashboard/requirements", icon: MessagesSquare },
  { label: "Profile", href: "/dashboard/profile", icon: UserRound },
] as const;
