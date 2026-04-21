"use client";

import type { Conversation } from "@hostely/shared";
import { useCallback, useEffect, useState } from "react";
import { chatApi } from "../services/chat.api";
import { useRealtime } from "@/providers/realtime-provider";

interface UseConversationsResult {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Loads conversation previews and keeps them fresh:
 *   - refetch on mount
 *   - refetch whenever any chat message arrives (cheap; the aggregate is bounded)
 */
export const useConversations = (): UseConversationsResult => {
  const { onChatMessage } = useRealtime();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const res = await chatApi.conversations();
      setConversations(res.conversations);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const unsub = onChatMessage(() => {
      void fetchAll();
    });
    return unsub;
  }, [onChatMessage, fetchAll]);

  return { conversations, loading, error, refetch: fetchAll };
};
