import { SOCKET_EVENTS, type ChatMessage, type Conversation } from "@hostely/shared";
import { Types } from "mongoose";
import { emitToUser } from "../../sockets/bus.js";
import { AppError } from "../../utils/AppError.js";
import { userRepository, type IUserRepository } from "../user/user.repository.js";
import { notificationService } from "../notification/notification.service.js";
import { chatRepository, type IChatRepository } from "./chat.repository.js";

/**
 * Chat business rules:
 *   - Cannot message yourself.
 *   - Recipient must be a real user.
 *   - Body is trimmed and bounded (model enforces hard limits, service
 *     rejects empty after trim).
 *   - On send: persist → emit `chat:message` to both parties → dispatch a
 *     notification to the recipient. Notification includes a deep link so
 *     the dropdown can open the thread directly.
 */
export class ChatService {
  constructor(
    private readonly chat: IChatRepository,
    private readonly users: IUserRepository,
  ) {}

  async send(fromId: string, toId: string, rawBody: string): Promise<ChatMessage> {
    if (fromId === toId) throw AppError.badRequest("Cannot message yourself");
    if (!Types.ObjectId.isValid(toId)) throw AppError.badRequest("Invalid recipient");
    const body = rawBody.trim();
    if (body.length === 0) throw AppError.badRequest("Message can't be empty");
    if (body.length > 4000) throw AppError.badRequest("Message too long");

    const [sender, recipient] = await Promise.all([
      this.users.findById(fromId),
      this.users.findById(toId),
    ]);
    if (!sender) throw AppError.unauthorized("Unknown user");
    if (!recipient) throw AppError.notFound("Recipient not found");

    const message = await this.chat.create(fromId, toId, body);

    // Fan out to both participants so each gets optimistic UI without extra polling.
    emitToUser(toId, SOCKET_EVENTS.CHAT_MESSAGE, { message });
    emitToUser(fromId, SOCKET_EVENTS.CHAT_MESSAGE, { message });

    // Durable notification — keeps the bell badge accurate across reconnects.
    await notificationService.dispatch({
      recipientId: toId,
      type: "message",
      title: `New message from ${sender.name}`,
      body: body.length > 120 ? `${body.slice(0, 117)}…` : body,
      link: `/dashboard/chat/${fromId}`,
    });

    return message;
  }

  async listThread(viewerId: string, peerId: string, limit = 100): Promise<ChatMessage[]> {
    if (!Types.ObjectId.isValid(peerId)) throw AppError.badRequest("Invalid peer");
    return this.chat.listThread(viewerId, peerId, limit);
  }

  async listConversations(viewerId: string): Promise<Conversation[]> {
    return this.chat.listConversations(viewerId);
  }

  async markRead(viewerId: string, peerId: string): Promise<number> {
    if (!Types.ObjectId.isValid(peerId)) return 0;
    return this.chat.markThreadRead(viewerId, peerId);
  }

  async unreadCount(viewerId: string): Promise<number> {
    return this.chat.countUnread(viewerId);
  }
}

export const chatService = new ChatService(chatRepository, userRepository);
