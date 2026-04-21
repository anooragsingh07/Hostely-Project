import type { ChatMessage, Conversation, ItemAuthor } from "@hostely/shared";
import { Types } from "mongoose";
import { UserModel } from "../user/user.model.js";
import { MessageModel, threadKeyOf, type MessageDoc } from "./message.model.js";

export interface IChatRepository {
  create(fromId: string, toId: string, body: string): Promise<ChatMessage>;
  listThread(userAId: string, userBId: string, limit: number): Promise<ChatMessage[]>;
  listConversations(userId: string): Promise<Conversation[]>;
  markThreadRead(userId: string, peerId: string): Promise<number>;
  countUnread(userId: string): Promise<number>;
}

type PopulatedUser = {
  _id: Types.ObjectId;
  name: string;
  hostelName: string;
  department: string;
  avatarUrl?: string;
};

const toPublicMessage = (doc: MessageDoc): ChatMessage => ({
  id: doc._id.toString(),
  fromId: doc.from.toString(),
  toId: doc.to.toString(),
  body: doc.body,
  read: Boolean(doc.read),
  createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
});

const toAuthor = (u: PopulatedUser): ItemAuthor => ({
  id: u._id.toString(),
  name: u.name,
  hostelName: u.hostelName,
  department: u.department,
  avatarUrl: u.avatarUrl,
});

export class ChatRepository implements IChatRepository {
  async create(fromId: string, toId: string, body: string): Promise<ChatMessage> {
    const doc = (await MessageModel.create({
      from: new Types.ObjectId(fromId),
      to: new Types.ObjectId(toId),
      threadKey: threadKeyOf(fromId, toId),
      body,
    })) as unknown as MessageDoc;
    return toPublicMessage(doc);
  }

  async listThread(userAId: string, userBId: string, limit: number): Promise<ChatMessage[]> {
    const docs = (await MessageModel.find({ threadKey: threadKeyOf(userAId, userBId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec()) as unknown as MessageDoc[];
    // Return oldest → newest for the UI; the find+sort gave us newest first.
    return docs.reverse().map(toPublicMessage);
  }

  async listConversations(userId: string): Promise<Conversation[]> {
    const uid = new Types.ObjectId(userId);

    // Aggregate the newest message per thread the user participates in,
    // then join the peer's profile. Unread = messages to me that are unread.
    const rows = (await MessageModel.aggregate([
      { $match: { $or: [{ from: uid }, { to: uid }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$threadKey",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$to", uid] }, { $eq: ["$read", false] }] }, 1, 0],
            },
          },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
      { $limit: 50 },
    ]).exec()) as Array<{
      _id: string;
      lastMessage: MessageDoc;
      unreadCount: number;
    }>;

    if (rows.length === 0) return [];

    const peerIds = rows.map((r) => {
      const from = r.lastMessage.from.toString();
      const to = r.lastMessage.to.toString();
      return from === userId ? to : from;
    });

    const peers = await UserModel.find({ _id: { $in: peerIds } })
      .select("name hostelName department avatarUrl")
      .lean<PopulatedUser[]>()
      .exec();
    const peerMap = new Map(peers.map((p) => [p._id.toString(), p]));

    const conversations: Conversation[] = [];
    rows.forEach((r, idx) => {
      const peerId = peerIds[idx] as string;
      const peer = peerMap.get(peerId);
      if (!peer) return;
      conversations.push({
        peer: toAuthor(peer),
        lastMessage: toPublicMessage(r.lastMessage),
        unreadCount: r.unreadCount,
        lastActivity: r.lastMessage.createdAt?.toISOString?.() ?? new Date().toISOString(),
      });
    });
    return conversations;
  }

  async markThreadRead(userId: string, peerId: string): Promise<number> {
    const res = await MessageModel.updateMany(
      {
        threadKey: threadKeyOf(userId, peerId),
        to: new Types.ObjectId(userId),
        read: false,
      },
      { $set: { read: true } },
    ).exec();
    return res.modifiedCount;
  }

  async countUnread(userId: string): Promise<number> {
    return MessageModel.countDocuments({
      to: new Types.ObjectId(userId),
      read: false,
    }).exec();
  }
}

export const chatRepository = new ChatRepository();
