"use client";

import { LifeBuoy, LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { cn } from "@/lib/cn";

interface UserMenuProps {
  name?: string;
  email?: string;
}

/** Avatar + name trigger → account actions. Used in the topbar. */
export const UserMenu = ({ name = "Guest", email }: UserMenuProps) => {
  const { signOut } = useAuth();
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex h-9 items-center gap-2 rounded-md px-1.5 text-sm transition-colors duration-200",
          "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <span
          aria-hidden
          className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-[11px] font-semibold tracking-tight text-secondary-foreground"
        >
          {initials || "H"}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[14rem]">
        <DropdownMenuLabel>Signed in</DropdownMenuLabel>
        <div className="px-2 pb-2">
          <p className="text-sm font-medium text-foreground truncate">{name}</p>
          {email && <p className="text-xs text-muted-foreground truncate">{email}</p>}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile">
            <UserRound className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/support">
            <LifeBuoy className="h-4 w-4" />
            Support
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut}>
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
