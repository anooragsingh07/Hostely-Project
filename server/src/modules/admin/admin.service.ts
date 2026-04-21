import type { AnalyticsSnapshot, AnalyticsTimelinePoint, Item } from "@hostely/shared";
import { Types, type PipelineStage } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { ItemModel, type ItemDoc } from "../item/item.model.js";
import { itemRepository, type IItemRepository } from "../item/item.repository.js";
import { RequirementModel } from "../requirement/requirement.model.js";
import { UserModel } from "../user/user.model.js";

/** How many hostels to include in the breakdown chart. */
const HOSTEL_TOP_N = 8;
/** Days in the activity timeline (end-inclusive today). */
const TIMELINE_DAYS = 30;

type CountRow = { _id: string | null; count: number };

/**
 * Admin / moderation operations. Keeps read aggregations and write
 * moderation ops on one surface; the admin UI consumes both.
 */
export class AdminService {
  constructor(private readonly items: IItemRepository = itemRepository) {}

  /** Aggregate snapshot for the admin dashboard. */
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

  /**
   * Admin-only listing. Reuses the item repository so pagination, owner
   * hydration, etc. are identical to the public Buy feed.
   */
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

  /** Flip a listing to `removed` — invisible in feeds, preserved for audit. */
  async removeItem(itemId: string): Promise<Item> {
    return this.setItemStatus(itemId, "removed");
  }

  /** Undo a moderation removal. */
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
    // Return via repo so author metadata matches other surfaces.
    const hydrated = await this.items.findById(itemId);
    if (!hydrated) throw AppError.notFound("Listing not found");
    return hydrated;
  }

  // ---------- aggregations ----------

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

  /** Generic group-by helper — `null`/empty keys are coalesced to "unknown". */
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

  /**
   * Last N days of new listings + requirements, zero-filled so charts
   * render continuous bars even when some days have no activity.
   */
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
