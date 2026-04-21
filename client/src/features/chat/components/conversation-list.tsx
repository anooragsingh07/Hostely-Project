"use client";

import type { Conversation } from "@hostely/shared";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/format";

interface ConversationListProps {
  conversations: Conversation[];
  activePeerId?: string | null;
  loading?: boolean;
  emptyHint?: string;
}

export const ConversationList = ({
  conversations,
  activePeerId,
  loading,
  emptyHint = "No conversations yet. Start one from an item's detail page.",
}: ConversationListProps) => {
  if (loading) {
    return <div className="text-muted-foreground p-3 text-xs">Loading conversations…</div>;
  }

  if (conversations.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-2 p-6 text-center text-xs">
        <MessageSquare className="h-5 w-5" />
        <p>{emptyHint}</p>
      </div>
    );
  }

  return (
    <ul className="divide-border divide-y">
      {conversations.map((c) => {
        const active = activePeerId === c.peer.id;
        return (
          <li key={c.peer.id}>
            <Link
              href={`/dashboard/chat/${c.peer.id}`}
              className={cn(
                "flex items-start gap-3 px-3 py-3 transition-colors",
                active ? "bg-accent" : "hover:bg-accent/60",
              )}
            >
              <span className="bg-primary/10 text-primary flex h-9 w-9 flex-none items-center justify-center rounded-full text-xs font-semibold">
                {c.peer.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-medium">{c.peer.name}</span>
                  <span className="text-muted-foreground flex-none text-[10px]">
                    {formatRelative(c.lastActivity)}
                  </span>
                </span>
                <span className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="text-muted-foreground min-w-0 flex-1 truncate text-xs">
                    {c.lastMessage?.body ?? "No messages yet"}
                  </span>
                  {c.unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground flex-none rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                      {c.unreadCount}
                    </span>
                  )}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
