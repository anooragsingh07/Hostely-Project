"use client";

import { SOCKET_EVENTS, type ChatMessage } from "@hostely/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { chatApi } from "../services/chat.api";
import { getSocket } from "@/lib/socket";
import { useRealtime } from "@/providers/realtime-provider";

interface UseChatThreadResult {
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  send: (body: string) => Promise<void>;
}

/**
 * Thread view state for a single peer.
 *   - Loads history once on mount / peer change.
 *   - Appends messages arriving via the global realtime listener.
 *   - Marks the thread as read on open + whenever a new inbound message
 *     lands while the tab is focused on it.
 *   - `send` uses the socket (with REST fallback) and relies on the socket
 *     echo to append — keeps ordering the same on both participants' screens.
 */
export const useChatThread = (
  peerId: string | null,
  viewerId: string | null,
): UseChatThreadResult => {
  const { onChatMessage, decrementUnreadMessages } = useRealtime();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seenIds = useRef(new Set<string>());

  const relevant = useCallback(
    (m: ChatMessage) =>
      peerId !== null &&
      viewerId !== null &&
      ((m.fromId === peerId && m.toId === viewerId) ||
        (m.fromId === viewerId && m.toId === peerId)),
    [peerId, viewerId],
  );

  useEffect(() => {
    if (!peerId) return;
    let cancelled = false;
    setLoading(true);
    chatApi
      .thread(peerId)
      .then((msgs) => {
        if (cancelled) return;
        seenIds.current = new Set(msgs.map((m) => m.id));
        setMessages(msgs);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load messages");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [peerId]);

  // Mark the thread read on open + emit over socket so other tabs update.
  useEffect(() => {
    if (!peerId || !viewerId) return;
    void chatApi.markRead(peerId).catch(() => undefined);
    try {
      getSocket().emit(SOCKET_EVENTS.CHAT_READ, peerId);
    } catch {
      // Socket may not be connected yet — server-side REST already handled it.
    }
    // Any inbound-from-peer messages in current state should count as read.
    setMessages((prev) =>
      prev.map((m) => (m.toId === viewerId && !m.read ? { ...m, read: true } : m)),
    );
  }, [peerId, viewerId]);

  useEffect(() => {
    const unsub = onChatMessage((m) => {
      if (!relevant(m)) return;
      if (seenIds.current.has(m.id)) return;
      seenIds.current.add(m.id);
      // Incoming from peer → mark read immediately; seller may be on screen.
      if (viewerId && m.toId === viewerId) {
        void chatApi.markRead(m.fromId).catch(() => undefined);
        decrementUnreadMessages(1);
        setMessages((prev) => [...prev, { ...m, read: true }]);
      } else {
        setMessages((prev) => [...prev, m]);
      }
    });
    return unsub;
  }, [onChatMessage, relevant, viewerId, decrementUnreadMessages]);

  const send = useCallback(
    async (body: string) => {
      if (!peerId) return;
      const trimmed = body.trim();
      if (!trimmed) return;
      setSending(true);
      try {
        // Prefer the socket path when connected; it's faster and the server
        // echoes the persisted row back through the same channel.
        const socket = getSocket();
        if (socket.connected) {
          await new Promise<void>((resolve, reject) => {
            socket
              .timeout(8000)
              .emit(
                SOCKET_EVENTS.CHAT_SEND,
                { toUserId: peerId, body: trimmed },
                (timeoutErr: Error | null, ack?: { ok: boolean; error?: string }) => {
                  if (timeoutErr) return reject(timeoutErr);
                  if (!ack?.ok) return reject(new Error(ack?.error ?? "Send failed"));
                  resolve();
                },
              );
          });
        } else {
          // Fallback — REST persists + broadcasts, so we'll still receive the echo.
          await chatApi.send({ toUserId: peerId, body: trimmed });
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Send failed");
      } finally {
        setSending(false);
      }
    },
    [peerId],
  );

  return { messages, loading, sending, error, send };
};
