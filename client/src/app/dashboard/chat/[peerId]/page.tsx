"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ChatWindow } from "@/features/chat/components/chat-window";
import { ConversationList } from "@/features/chat/components/conversation-list";
import { useConversations } from "@/features/chat/hooks/use-conversations";

export default function ChatThreadPage() {
  const params = useParams<{ peerId: string }>();
  const peerId = params?.peerId ?? "";
  const { conversations, loading } = useConversations();

  const activeConversation = useMemo(
    () => conversations.find((c) => c.peer.id === peerId),
    [conversations, peerId],
  );

  const peerName = activeConversation?.peer.name;
  const peerSubtitle = activeConversation
    ? [activeConversation.peer.hostelName, activeConversation.peer.department]
        .filter(Boolean)
        .join(" · ")
    : undefined;

  return (
    <AppShell title="Chat" description="Direct messages with buyers and sellers on campus.">
      <div className="grid h-[calc(100vh-9rem)] grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
        <aside className="border-border bg-background hidden overflow-hidden rounded-lg border md:block">
          <div className="border-border border-b px-3 py-2">
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.08em]">
              Conversations
            </p>
          </div>
          <div className="max-h-full overflow-y-auto">
            <ConversationList
              conversations={conversations}
              activePeerId={peerId}
              loading={loading}
            />
          </div>
        </aside>

        <section className="border-border bg-background overflow-hidden rounded-lg border">
          <ChatWindow peerId={peerId} peerName={peerName} peerSubtitle={peerSubtitle} />
        </section>
      </div>
    </AppShell>
  );
}
