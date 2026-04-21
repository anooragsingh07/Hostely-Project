import { SOCKET_EVENTS, type Notification, type NotificationType } from "@hostely/shared";
import { emitToUser } from "../../sockets/bus.js";
import { AppError } from "../../utils/AppError.js";
import { notificationRepository, type INotificationRepository } from "./notification.repository.js";

export interface DispatchNotificationInput {
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}

/**
 * The only surface business services call. Persists the notification
 * and publishes it over the socket bus in one step so the two can't
 * drift out of sync.
 */
export class NotificationService {
  constructor(private readonly repo: INotificationRepository) {}

  async dispatch(input: DispatchNotificationInput): Promise<Notification> {
    const notification = await this.repo.create(input);
    emitToUser(input.recipientId, SOCKET_EVENTS.NOTIFICATION_NEW, { notification });
    return notification;
  }

  async listForUser(userId: string, limit = 30): Promise<Notification[]> {
    return this.repo.list(userId, limit);
  }

  async countUnread(userId: string): Promise<number> {
    return this.repo.countUnread(userId);
  }

  async markRead(id: string, userId: string): Promise<void> {
    const ok = await this.repo.markRead(id, userId);
    if (!ok) throw AppError.notFound("Notification not found");
  }

  async markAllRead(userId: string): Promise<number> {
    return this.repo.markAllRead(userId);
  }
}

export const notificationService = new NotificationService(notificationRepository);
