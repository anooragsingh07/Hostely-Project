"use client";

import { Send } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMe } from "@/features/auth/hooks/use-me";
import { useChatThread } from "../hooks/use-chat-thread";
import { MessageBubble } from "./message-bubble";

interface ChatWindowProps {
  peerId: string;
  peerName?: string;
  peerSubtitle?: string;
}

/**
 * Live thread view. Auto-scrolls to the bottom on new messages (but not
 * when the user has scrolled up reading history — tracked via a "stuck to
 * bottom" flag).
 */
export const ChatWindow = ({ peerId, peerName, peerSubtitle }: ChatWindowProps) => {
  const { user } = useMe();
  const { messages, loading, sending, error, send } = useChatThread(peerId, user?.id ?? null);
  const [draft, setDraft] = useState("");
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = useRef(true);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !stickToBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    stickToBottomRef.current = atBottom;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const body = draft;
    setDraft("");
    stickToBottomRef.current = true;
    await send(body);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-border flex h-14 flex-none items-center gap-3 border-b px-4">
        <span className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
          {(peerName ?? "U").slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{peerName ?? "Chat"}</p>
          {peerSubtitle && <p className="text-muted-foreground truncate text-xs">{peerSubtitle}</p>}
        </div>
      </div>

      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="flex-1 space-y-2 overflow-y-auto px-4 py-4"
      >
        {loading ? (
          <p className="text-muted-foreground text-center text-xs">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-muted-foreground pt-8 text-center text-xs">
            Say hello — this is the start of your conversation.
          </p>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} mine={m.fromId === user?.id} />)
        )}
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/5 text-destructive border-t px-4 py-2 text-xs">
          {error}
        </div>
      )}

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="border-border flex flex-none items-end gap-2 border-t p-3"
      >
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          rows={1}
          className="max-h-32 min-h-[40px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void onSubmit(e as unknown as FormEvent<HTMLFormElement>);
            }
          }}
        />
        <Button type="submit" size="icon" disabled={sending || !draft.trim()}>
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
};
