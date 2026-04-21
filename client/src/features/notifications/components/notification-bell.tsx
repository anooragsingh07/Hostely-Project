"use client";

import type { Notification } from "@hostely/shared";
import { Bell, CheckCheck, Heart, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useRealtime } from "@/providers/realtime-provider";

const iconFor = (type: Notification["type"]) => {
  switch (type) {
    case "interest":
      return Heart;
    case "comment":
      return MessageSquare;
    case "message":
      return MessageSquare;
    default:
      return Bell;
  }
};

/**
 * Bell button + dropdown. Keeps its own `open` state so we can close the
 * menu when an item is activated (avoids fighting Radix's focus handling).
 */
export const NotificationBell = () => {
  const router = useRouter();
  const { notifications, unreadNotifications, markNotificationRead, markAllNotificationsRead } =
    useRealtime();
  const [open, setOpen] = useState(false);

  const handleActivate = async (n: Notification) => {
    setOpen(false);
    if (!n.read) void markNotificationRead(n.id);
    if (n.link) router.push(n.link);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={
            unreadNotifications > 0
              ? `Notifications — ${unreadNotifications} unread`
              : "Notifications"
          }
          className={cn(
            "border-input bg-background text-muted-foreground shadow-subtle hover:bg-accent hover:text-foreground relative inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors duration-200",
          )}
        >
          <Bell className="h-4 w-4" />
          {unreadNotifications > 0 && (
            <span className="bg-primary text-primary-foreground absolute -right-1 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none">
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-0" sideOffset={8}>
        <div className="border-border flex items-center justify-between border-b px-3 py-2">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-muted-foreground text-xs">
              {unreadNotifications > 0 ? `${unreadNotifications} unread` : "You're all caught up"}
            </p>
          </div>
          {unreadNotifications > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => void markAllNotificationsRead()}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-muted-foreground p-6 text-center text-xs">
              No notifications yet. We&apos;ll let you know when something happens.
            </div>
          ) : (
            <ul className="divide-border divide-y">
              {notifications.map((n) => {
                const Icon = iconFor(n.type);
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => void handleActivate(n)}
                      className={cn(
                        "group flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors",
                        n.read ? "bg-transparent" : "bg-accent/40",
                        "hover:bg-accent",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full",
                          n.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-medium">{n.title}</span>
                          <span className="text-muted-foreground flex-none text-[10px]">
                            {formatRelative(n.createdAt)}
                          </span>
                        </span>
                        <span className="text-muted-foreground mt-0.5 line-clamp-2 block text-xs">
                          {n.body}
                        </span>
                      </span>
                      {!n.read && (
                        <span className="bg-primary mt-2 h-1.5 w-1.5 flex-none rounded-full" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
