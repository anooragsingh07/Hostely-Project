import type { Role } from "@hostely/shared";
import { ROLES } from "@hostely/shared";
import {
  Home,
  MessageSquare,
  MessagesSquare,
  Shield,
  ShoppingBag,
  Store,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** When set, the item is only rendered for a user matching one of these roles. */
  roles?: readonly Role[];
}

/** Primary product surfaces. Order reflects the user's mental model. */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Buy", href: "/dashboard/buy", icon: ShoppingBag },
  { label: "Sell", href: "/dashboard/sell", icon: Store },
  { label: "Requirements", href: "/dashboard/requirements", icon: MessagesSquare },
  { label: "Chat", href: "/dashboard/chat", icon: MessageSquare },
  { label: "Profile", href: "/dashboard/profile", icon: UserRound },
  { label: "Admin", href: "/dashboard/admin", icon: Shield, roles: [ROLES.ADMIN] },
] as const;

/** Filter nav items to what the current role is allowed to see. */
export const filterNavForRole = (
  items: readonly NavItem[],
  role: Role | null | undefined,
): NavItem[] => items.filter((item) => !item.roles || (role ? item.roles.includes(role) : false));
