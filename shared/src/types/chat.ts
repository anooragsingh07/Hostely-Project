import type { ItemAuthor } from "./item";

export interface ChatMessage {
  id: string;
  /** Sender user id. */
  fromId: string;
  /** Recipient user id. */
  toId: string;
  body: string;
  read: boolean;
  createdAt: string;
}

/**
 * A conversation — the peer plus a cached preview for the list surface.
 * `unreadCount` is for the viewer only.
 */
export interface Conversation {
  peer: ItemAuthor;
  lastMessage?: ChatMessage;
  unreadCount: number;
  lastActivity: string;
}

/** Payload accepted by the `chat:send` socket event / REST fallback. */
export interface SendChatMessagePayload {
  toUserId: string;
  body: string;
}
