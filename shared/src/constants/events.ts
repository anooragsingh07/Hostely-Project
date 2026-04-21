/**
 * Canonical socket event names. Client and server import from here so any
 * rename is a single-place change and typos become compile errors.
 *
 * Naming convention: `<domain>:<verb>`.
 */
export const SOCKET_EVENTS = {
  /** Server → client. A new persisted notification is ready to display. */
  NOTIFICATION_NEW: "notification:new",

  /** Server → client. A chat message was delivered for this user. */
  CHAT_MESSAGE: "chat:message",

  /** Client → server. Send a one-to-one chat message. */
  CHAT_SEND: "chat:send",

  /** Client → server. Mark messages in a conversation as read. */
  CHAT_READ: "chat:read",
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

/** Per-user Socket.io room — join on connect, emit here for direct delivery. */
export const userRoom = (userId: string): string => `user:${userId}`;

/** Kinds of notifications the product surfaces. */
export const NOTIFICATION_TYPES = ["interest", "comment", "message"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
