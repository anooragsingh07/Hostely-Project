import type { Interest } from "@hostely/shared";
import { Types } from "mongoose";
import { UserModel } from "../user/user.model.js";
import { InterestModel, type InterestDoc } from "./interest.model.js";

export interface IInterestRepository {
  add(
    itemId: string,
    userId: string,
    note?: string,
  ): Promise<{ interest: Interest; created: boolean }>;
  remove(itemId: string, userId: string): Promise<boolean>;
  existsByUser(itemId: string, userId: string): Promise<boolean>;
  listByItem(itemId: string): Promise<Interest[]>;
}

type PopulatedUser = {
  _id: Types.ObjectId;
  name: string;
  hostelName: string;
  department: string;
  avatarUrl?: string;
};

const toPublic = (doc: InterestDoc, user: PopulatedUser | null): Interest => ({
  id: doc._id.toString(),
  itemId: doc.item.toString(),
  note: doc.note ?? undefined,
  user: user
    ? {
        id: user._id.toString(),
        name: user.name,
        hostelName: user.hostelName,
        department: user.department,
        avatarUrl: user.avatarUrl,
      }
    : { id: doc.user.toString(), name: "Unknown", hostelName: "", department: "" },
  createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
});

export class InterestRepository implements IInterestRepository {
  async add(itemId: string, userId: string, note?: string) {
    const itemObjectId = new Types.ObjectId(itemId);
    const userObjectId = new Types.ObjectId(userId);

    let created = true;
    let doc: InterestDoc;
    try {
      doc = (await InterestModel.create({
        item: itemObjectId,
        user: userObjectId,
        note: note ?? undefined,
      })) as unknown as InterestDoc;
    } catch (err) {
      // Duplicate key → already marked; return the existing row.
      const code = (err as { code?: number }).code;
      if (code !== 11000) throw err;
      created = false;
      doc = (await InterestModel.findOne({
        item: itemObjectId,
        user: userObjectId,
      }).exec()) as unknown as InterestDoc;
    }

    const user = await UserModel.findById(userId)
      .select("name hostelName department avatarUrl")
      .lean<PopulatedUser>()
      .exec();
    return { interest: toPublic(doc, user), created };
  }

  async remove(itemId: string, userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(itemId)) return false;
    const res = await InterestModel.deleteOne({
      item: new Types.ObjectId(itemId),
      user: new Types.ObjectId(userId),
    }).exec();
    return res.deletedCount === 1;
  }

  async existsByUser(itemId: string, userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(itemId)) return false;
    const hit = await InterestModel.exists({
      item: new Types.ObjectId(itemId),
      user: new Types.ObjectId(userId),
    }).exec();
    return Boolean(hit);
  }

  async listByItem(itemId: string): Promise<Interest[]> {
    if (!Types.ObjectId.isValid(itemId)) return [];
    const docs = (await InterestModel.find({ item: new Types.ObjectId(itemId) })
      .sort({ createdAt: -1 })
      .exec()) as unknown as InterestDoc[];
    const userIds = Array.from(new Set(docs.map((d) => d.user.toString())));
    const users = userIds.length
      ? await UserModel.find({ _id: { $in: userIds } })
          .select("name hostelName department avatarUrl")
          .lean<PopulatedUser[]>()
          .exec()
      : [];
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));
    return docs.map((d) => toPublic(d, userMap.get(d.user.toString()) ?? null));
  }
}

export const interestRepository = new InterestRepository();
