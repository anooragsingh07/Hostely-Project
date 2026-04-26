import type {
  AnalyticsSnapshot,
  AnalyticsTimelinePoint,
  Item,
  Paginated,
  PublicUser,
  Requirement,
  Role,
} from "@hostely/shared";
import { ROLES, getHostel } from "@hostely/shared";
import { Types, type PipelineStage } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { hashPassword } from "../../utils/password.js";
import { MessageModel, threadKeyOf, type MessageDoc } from "../chat/message.model.js";
import { commentRepository } from "../comment/comment.repository.js";
import { categoryService, type CategoryService } from "../category/category.service.js";
import { ItemModel, type ItemDoc } from "../item/item.model.js";
import { itemRepository, type IItemRepository } from "../item/item.repository.js";
import type { UpdateItemInput } from "../item/item.types.js";
import { RequirementModel } from "../requirement/requirement.model.js";
import { UserModel } from "../user/user.model.js";
import {
  requirementRepository,
  type IRequirementRepository,
} from "../requirement/requirement.repository.js";
import type { UpdateRequirementInput } from "../requirement/requirement.types.js";
import { userRepository, type IUserRepository } from "../user/user.repository.js";
import type { AdminUpdateItemBody, AdminUpdateRequirementBody } from "./admin.validator.js";

const HOSTEL_TOP_N = 8;
const TIMELINE_DAYS = 30;

type CountRow = { _id: string | null; count: number };

export interface AdminChatThreadSummary {
  threadKey: string;
  userA: string;
  userB: string;
  messageCount: number;
  lastBody: string;
  lastAt: string;
}

export class AdminService {
  constructor(
    private readonly items: IItemRepository = itemRepository,
    private readonly users: IUserRepository = userRepository,
    private readonly reqs: IRequirementRepository = requirementRepository,
    private readonly categories: CategoryService = categoryService,
  ) {}

  async analytics(): Promise<AnalyticsSnapshot> {
    const [
      totals,
      itemsByStatus,
      itemsByCategory,
      itemsByHostel,
      requirementsByCategory,
      timeline,
    ] = await Promise.all([
      this.totals(),
      this.groupItemsBy("status"),
      this.groupItemsBy("category"),
      this.groupItemsBy("hostelName", HOSTEL_TOP_N),
      this.groupRequirementsByCategory(),
      this.buildTimeline(),
    ]);

    return {
      totals,
      itemsByStatus: itemsByStatus.map((row) => ({
        label: (row.label as AnalyticsSnapshot["itemsByStatus"][number]["label"]) ?? "active",
        count: row.count,
      })),
      itemsByCategory,
      itemsByHostel,
      requirementsByCategory,
      timeline,
      generatedAt: new Date().toISOString(),
    };
  }

  async listItems(params: {
    page: number;
    pageSize: number;
    status?: Item["status"];
    category?: string;
    hostelName?: string;
    q?: string;
  }) {
    return this.items.list({
      q: params.q,
      category: params.category,
      hostelName: params.hostelName,
      status: params.status,
      page: params.page,
      pageSize: params.pageSize,
    });
  }

  async updateItem(itemId: string, body: AdminUpdateItemBody): Promise<Item> {
    const patch = body as UpdateItemInput;
    if (patch.category) await this.categories.assertActive(patch.category);
    const item = await this.items.updateAsAdmin(itemId, patch);
    if (!item) throw AppError.notFound("Listing not found");
    return item;
  }

  async removeItem(itemId: string): Promise<Item> {
    return this.setItemStatus(itemId, "removed");
  }

  async restoreItem(itemId: string): Promise<Item> {
    return this.setItemStatus(itemId, "active");
  }

  private async setItemStatus(itemId: string, status: Item["status"]): Promise<Item> {
    if (!Types.ObjectId.isValid(itemId)) throw AppError.notFound("Listing not found");
    const doc = (await ItemModel.findByIdAndUpdate(
      itemId,
      { $set: { status } },
      { new: true },
    ).exec()) as unknown as ItemDoc | null;
    if (!doc) throw AppError.notFound("Listing not found");
    const hydrated = await this.items.findById(itemId);
    if (!hydrated) throw AppError.notFound("Listing not found");
    return hydrated;
  }

  async listUsers(params: {
    page: number;
    pageSize: number;
    q?: string;
  }): Promise<Paginated<PublicUser>> {
    const { users, total } = await this.users.listPaginated(params);
    return { items: users, page: params.page, pageSize: params.pageSize, total };
  }

  async patchUser(
    actorId: string,
    targetId: string,
    patch: { role?: Role; banned?: boolean },
  ): Promise<PublicUser> {
    if (!Types.ObjectId.isValid(targetId)) throw AppError.notFound("User not found");
    const target = await this.users.findById(targetId);
    if (!target) throw AppError.notFound("User not found");

    if (patch.banned === true && targetId === actorId) {
      throw AppError.badRequest("You cannot ban yourself");
    }

    if (patch.banned === true && target.role === ROLES.ADMIN) {
      const admins = await this.users.countByRole(ROLES.ADMIN);
      if (admins <= 1) throw AppError.badRequest("Cannot ban the last admin");
    }

    if (patch.role !== undefined && patch.role !== ROLES.ADMIN && target.role === ROLES.ADMIN) {
      const admins = await this.users.countByRole(ROLES.ADMIN);
      if (admins <= 1) throw AppError.badRequest("Cannot demote the last admin");
    }

    if (patch.role !== undefined && patch.role !== ROLES.ADMIN && targetId === actorId) {
      throw AppError.badRequest("You cannot remove your own admin role");
    }

    const updated = await this.users.updateAdminFields(targetId, patch);
    if (!updated) throw AppError.notFound("User not found");
    return updated;
  }

  async resetUserPassword(targetId: string, newPassword: string): Promise<void> {
    if (!Types.ObjectId.isValid(targetId)) throw AppError.notFound("User not found");
    const user = await this.users.findById(targetId);
    if (!user) throw AppError.notFound("User not found");
    const passwordHash = await hashPassword(newPassword);
    const ok = await this.users.setPasswordHash(targetId, passwordHash);
    if (!ok) throw AppError.notFound("User not found");
  }

  async listRequirements(params: {
    page: number;
    pageSize: number;
    status?: Requirement["status"];
    category?: string;
    hostelName?: string;
    q?: string;
  }): Promise<Paginated<Requirement>> {
    return this.reqs.list({
      q: params.q,
      category: params.category,
      hostelName: params.hostelName,
      status: params.status,
      page: params.page,
      pageSize: params.pageSize,
    });
  }

  async removeRequirement(id: string): Promise<Requirement> {
    return this.setRequirementStatus(id, "removed");
  }

  async restoreRequirement(id: string): Promise<Requirement> {
    return this.setRequirementStatus(id, "open");
  }

  private async setRequirementStatus(
    id: string,
    status: Requirement["status"],
  ): Promise<Requirement> {
    if (!Types.ObjectId.isValid(id)) throw AppError.notFound("Requirement not found");
    const updated = await this.reqs.updateAsAdmin(id, { status });
    if (!updated) throw AppError.notFound("Requirement not found");
    return updated;
  }

  async updateRequirement(id: string, body: AdminUpdateRequirementBody): Promise<Requirement> {
    const patch: UpdateRequirementInput = { ...body };
    if (patch.category) await this.categories.assertActive(patch.category);
    if (patch.hostelName) {
      patch.hostelName = getHostel(patch.hostelName)?.name ?? patch.hostelName;
    }
    const updated = await this.reqs.updateAsAdmin(id, patch);
    if (!updated) throw AppError.notFound("Requirement not found");
    return updated;
  }

  async deleteComment(commentId: string): Promise<void> {
    const ok = await commentRepository.delete(commentId);
    if (!ok) throw AppError.notFound("Comment not found");
  }

  async deleteChatMessage(messageId: string): Promise<void> {
    if (!Types.ObjectId.isValid(messageId)) throw AppError.notFound("Message not found");
    const res = await MessageModel.deleteOne({ _id: messageId }).exec();
    if (res.deletedCount !== 1) throw AppError.notFound("Message not found");
  }

  async purgeChatThread(userA: string, userB: string): Promise<{ deleted: number }> {
    if (!Types.ObjectId.isValid(userA) || !Types.ObjectId.isValid(userB)) {
      throw AppError.badRequest("Invalid user id");
    }
    const key = threadKeyOf(userA, userB);
    const res = await MessageModel.deleteMany({ threadKey: key }).exec();
    return { deleted: res.deletedCount };
  }

  async listChatThreads(params: {
    page: number;
    pageSize: number;
  }): Promise<Paginated<AdminChatThreadSummary>> {
    const skip = (params.page - 1) * params.pageSize;
    const pipeline: PipelineStage[] = [
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$threadKey",
          lastMessage: { $first: "$$ROOT" },
          messageCount: { $sum: 1 },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
      {
        $facet: {
          rows: [{ $skip: skip }, { $limit: params.pageSize }],
          total: [{ $count: "n" }],
        },
      },
    ];
    const agg = (await MessageModel.aggregate(pipeline).exec()) as unknown as Array<{
      rows: Array<{ _id: string; lastMessage: MessageDoc; messageCount: number }>;
      total: Array<{ n: number }>;
    }>;
    const row = agg[0];
    const rows = row?.rows ?? [];
    const total = row?.total?.[0]?.n ?? 0;
    const items: AdminChatThreadSummary[] = rows.map((r) => {
      const lm = r.lastMessage;
      const from = lm.from.toString();
      const to = lm.to.toString();
      return {
        threadKey: r._id,
        userA: from < to ? from : to,
        userB: from < to ? to : from,
        messageCount: r.messageCount,
        lastBody: lm.body.length > 160 ? `${lm.body.slice(0, 157)}…` : lm.body,
        lastAt: lm.createdAt?.toISOString?.() ?? new Date().toISOString(),
      };
    });
    return { items, page: params.page, pageSize: params.pageSize, total };
  }

  private async totals(): Promise<AnalyticsSnapshot["totals"]> {
    const [items, activeItems, removedItems, requirements, users] = await Promise.all([
      ItemModel.estimatedDocumentCount().exec(),
      ItemModel.countDocuments({ status: "active" }).exec(),
      ItemModel.countDocuments({ status: "removed" }).exec(),
      RequirementModel.estimatedDocumentCount().exec(),
      UserModel.estimatedDocumentCount().exec(),
    ]);
    return { items, activeItems, removedItems, requirements, users };
  }

  private async groupItemsBy(
    field: "status" | "category" | "hostelName",
    limit?: number,
  ): Promise<Array<{ label: string; count: number }>> {
    const pipeline: PipelineStage[] = [
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ];
    if (limit) pipeline.push({ $limit: limit });
    const rows = (await ItemModel.aggregate(pipeline).exec()) as CountRow[];
    return rows.map((row) => ({ label: row._id ?? "unknown", count: row.count }));
  }

  private async groupRequirementsByCategory(): Promise<Array<{ label: string; count: number }>> {
    const rows = (await RequirementModel.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).exec()) as CountRow[];
    return rows.map((row) => ({ label: row._id ?? "unknown", count: row.count }));
  }

  private async buildTimeline(): Promise<AnalyticsTimelinePoint[]> {
    const end = new Date();
    end.setUTCHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (TIMELINE_DAYS - 1));

    const groupByDay = (createdField: "createdAt"): PipelineStage[] => [
      { $match: { [createdField]: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: `$${createdField}`, timezone: "UTC" } },
          count: { $sum: 1 },
        },
      },
    ];

    const [itemRows, reqRows] = (await Promise.all([
      ItemModel.aggregate(groupByDay("createdAt")).exec(),
      RequirementModel.aggregate(groupByDay("createdAt")).exec(),
    ])) as [CountRow[], CountRow[]];

    const itemMap = new Map(itemRows.map((r) => [r._id, r.count]));
    const reqMap = new Map(reqRows.map((r) => [r._id, r.count]));

    const out: AnalyticsTimelinePoint[] = [];
    for (let i = 0; i < TIMELINE_DAYS; i += 1) {
      const day = new Date(start);
      day.setUTCDate(start.getUTCDate() + i);
      const key = day.toISOString().slice(0, 10);
      out.push({
        date: key,
        items: itemMap.get(key) ?? 0,
        requirements: reqMap.get(key) ?? 0,
      });
    }
    return out;
  }
}

export const adminService = new AdminService();
