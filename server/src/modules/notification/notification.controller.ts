import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import { requireUserId } from "../../utils/requireUser.js";
import { notificationService } from "./notification.service.js";

export const notificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const [notifications, unreadCount] = await Promise.all([
      notificationService.listForUser(userId, 50),
      notificationService.countUnread(userId),
    ]);
    return ok(res, { notifications, unreadCount });
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const id = req.params.id as string;
    await notificationService.markRead(id, userId);
    res.status(204).end();
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const updated = await notificationService.markAllRead(userId);
    return ok(res, { updated });
  }),
};
