"use client";

import { SOCKET_EVENTS, type ChatMessage, type Notification } from "@hostely/shared";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useMe } from "@/features/auth/hooks/use-me";
import { chatApi } from "@/features/chat/services/chat.api";
import { notificationsApi } from "@/features/notifications/services/notifications.api";
import { getSocket, resetSocket } from "@/lib/socket";

type ChatListener = (message: ChatMessage) => void;

interface RealtimeContextValue {
  notifications: Notification[];
  unreadNotifications: number;
  unreadMessages: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  /** Subscribe to every chat message arriving for the current user. Returns an unsubscribe fn. */
  onChatMessage: (listener: ChatListener) => () => void;
  /** Local counter bump — page-level views decrement after marking a thread read. */
  decrementUnreadMessages: (by: number) => void;
  refetchChatUnread: () => Promise<void>;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

/**
 * Bridges the authenticated socket connection with the rest of the app.
 * Responsibilities:
 *   - Connect once the user is known; disconnect on sign out.
 *   - Hydrate notifications + chat unread count on mount / reconnect.
 *   - Broadcast incoming chat messages to subscribed components.
 *   - Surface a toast on new notifications so the UI is alive even if
 *     the dropdown isn't open.
 */
export const RealtimeProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const { user, loading } = useMe();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const chatListeners = useRef(new Set<ChatListener>());

  const hydrate = useCallback(async () => {
    try {
      const [notif, chat] = await Promise.all([notificationsApi.list(), chatApi.conversations()]);
      setNotifications(notif.notifications);
      setUnreadNotifications(notif.unreadCount);
      setUnreadMessages(chat.unreadCount);
    } catch {
      // Swallow — unauthenticated users or transient network errors
      // just leave the provider in its empty state.
    }
  }, []);

  useEffect(() => {
    if (loading || !user) return;
    const socket = getSocket();

    void hydrate();

    const onNotification = ({ notification }: { notification: Notification }) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
      setUnreadNotifications((c) => c + 1);
      toast(notification.title, { description: notification.body });
    };

    const onChatMessage = ({ message }: { message: ChatMessage }) => {
      if (message.toId === user.id && !message.read) {
        setUnreadMessages((c) => c + 1);
      }
      chatListeners.current.forEach((fn) => fn(message));
    };

    const onConnect = () => void hydrate();

    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, onNotification);
    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, onChatMessage);
    socket.on("connect", onConnect);

    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, onNotification);
      socket.off(SOCKET_EVENTS.CHAT_MESSAGE, onChatMessage);
      socket.off("connect", onConnect);
    };
  }, [loading, user, hydrate]);

  // On sign-out drop the socket + stored state.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      resetSocket();
      setNotifications([]);
      setUnreadNotifications(0);
      setUnreadMessages(0);
    }
  }, [loading, user]);

  const markNotificationRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadNotifications((c) => Math.max(0, c - 1));
    try {
      await notificationsApi.markRead(id);
    } catch {
      // Best-effort; silent rollback isn't worth the UX noise here.
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadNotifications(0);
    try {
      await notificationsApi.markAllRead();
    } catch {
      // silent
    }
  }, []);

  const onChatMessage = useCallback((listener: ChatListener) => {
    chatListeners.current.add(listener);
    return () => {
      chatListeners.current.delete(listener);
    };
  }, []);

  const decrementUnreadMessages = useCallback((by: number) => {
    if (by <= 0) return;
    setUnreadMessages((c) => Math.max(0, c - by));
  }, []);

  const refetchChatUnread = useCallback(async () => {
    try {
      const res = await chatApi.conversations();
      setUnreadMessages(res.unreadCount);
    } catch {
      // silent
    }
  }, []);

  const value = useMemo<RealtimeContextValue>(
    () => ({
      notifications,
      unreadNotifications,
      unreadMessages,
      markNotificationRead,
      markAllNotificationsRead,
      onChatMessage,
      decrementUnreadMessages,
      refetchChatUnread,
    }),
    [
      notifications,
      unreadNotifications,
      unreadMessages,
      markNotificationRead,
      markAllNotificationsRead,
      onChatMessage,
      decrementUnreadMessages,
      refetchChatUnread,
    ],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
};

export const useRealtime = (): RealtimeContextValue => {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    throw new Error("useRealtime must be used inside <RealtimeProvider>");
  }
  return ctx;
};
