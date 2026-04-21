import { Home, MessageSquare, ShoppingBag, Tag, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Primary product surfaces. Order matters — it's the user's mental model. */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Listings", href: "/dashboard/listings", icon: Tag },
  { label: "Chat", href: "/dashboard/chat", icon: MessageSquare },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Profile", href: "/dashboard/profile", icon: UserRound },
] as const;
