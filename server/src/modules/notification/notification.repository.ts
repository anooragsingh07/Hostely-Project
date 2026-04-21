import type { Notification, NotificationType } from "@hostely/shared";
import { Types } from "mongoose";
import { NotificationModel, type NotificationDoc } from "./notification.model.js";

export interface CreateNotificationInput {
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}

export interface INotificationRepository {
  create(input: CreateNotificationInput): Promise<Notification>;
  list(recipientId: string, limit: number): Promise<Notification[]>;
  countUnread(recipientId: string): Promise<number>;
  markRead(id: string, recipientId: string): Promise<boolean>;
  markAllRead(recipientId: string): Promise<number>;
}

const toPublic = (doc: NotificationDoc): Notification => ({
  id: doc._id.toString(),
  recipientId: doc.recipient.toString(),
  type: doc.type as NotificationType,
  title: doc.title,
  body: doc.body,
  link: doc.link ?? undefined,
  read: Boolean(doc.read),
  createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
});

export class NotificationRepository implements INotificationRepository {
  async create(input: CreateNotificationInput): Promise<Notification> {
    const doc = (await NotificationModel.create({
      recipient: new Types.ObjectId(input.recipientId),
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
    })) as unknown as NotificationDoc;
    return toPublic(doc);
  }

  async list(recipientId: string, limit: number): Promise<Notification[]> {
    const docs = (await NotificationModel.find({
      recipient: new Types.ObjectId(recipientId),
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec()) as unknown as NotificationDoc[];
    return docs.map(toPublic);
  }

  async countUnread(recipientId: string): Promise<number> {
    return NotificationModel.countDocuments({
      recipient: new Types.ObjectId(recipientId),
      read: false,
    }).exec();
  }

  async markRead(id: string, recipientId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await NotificationModel.updateOne(
      { _id: id, recipient: new Types.ObjectId(recipientId) },
      { $set: { read: true } },
    ).exec();
    return res.modifiedCount > 0;
  }

  async markAllRead(recipientId: string): Promise<number> {
    const res = await NotificationModel.updateMany(
      { recipient: new Types.ObjectId(recipientId), read: false },
      { $set: { read: true } },
    ).exec();
    return res.modifiedCount;
  }
}

export const notificationRepository = new NotificationRepository();
