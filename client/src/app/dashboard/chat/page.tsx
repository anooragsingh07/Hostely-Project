"use client";

import { MessageSquare } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { ConversationList } from "@/features/chat/components/conversation-list";
import { useConversations } from "@/features/chat/hooks/use-conversations";

export default function ChatIndexPage() {
  const { conversations, loading } = useConversations();

  return (
    <AppShell title="Chat" description="Direct messages with buyers and sellers on campus.">
      <div className="grid h-[calc(100vh-9rem)] grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
        <aside className="border-border bg-background overflow-hidden rounded-lg border">
          <div className="border-border border-b px-3 py-2">
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.08em]">
              Conversations
            </p>
          </div>
          <div className="max-h-full overflow-y-auto">
            <ConversationList conversations={conversations} loading={loading} />
          </div>
        </aside>

        <section className="border-border bg-background flex items-center justify-center rounded-lg border p-8">
          <EmptyState
            icon={MessageSquare}
            title="Pick a conversation"
            description="Select a chat on the left, or head to an item and tap 'Message seller' to start a new one."
          />
        </section>
      </div>
    </AppShell>
  );
}
