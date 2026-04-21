import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { created, ok } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { chatService } from "./chat.service.js";
import type { PeerParam, SendMessageBody } from "./chat.validator.js";

const requireUser = (req: Request): string => {
  if (!req.user) throw AppError.unauthorized();
  return req.user.sub;
};

/**
 * HTTP surface for chat. Most writes come in through the socket, but we
 * expose REST too so the UI can send messages when the socket is down
 * (and so non-browser clients can integrate).
 */
export const chatController = {
  conversations: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUser(req);
    const [conversations, unreadCount] = await Promise.all([
      chatService.listConversations(userId),
      chatService.unreadCount(userId),
    ]);
    return ok(res, { conversations, unreadCount });
  }),

  thread: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUser(req);
    const { peerId } = req.params as PeerParam;
    const messages = await chatService.listThread(userId, peerId);
    return ok(res, { messages });
  }),

  send: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUser(req);
    const { toUserId, body } = req.body as SendMessageBody;
    const message = await chatService.send(userId, toUserId, body);
    return created(res, { message });
  }),

  read: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUser(req);
    const { peerId } = req.params as PeerParam;
    const updated = await chatService.markRead(userId, peerId);
    return ok(res, { updated });
  }),
};
