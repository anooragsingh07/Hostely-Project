import type { Item, Paginated } from "@hostely/shared";
import { getHostel, hostelsInZone } from "@hostely/shared";
import { Types, type FilterQuery, type PipelineStage } from "mongoose";
import { UserModel } from "../user/user.model.js";
import { ItemModel, type ItemDoc } from "./item.model.js";
import type { CreateItemInput, ListItemsFilter, UpdateItemInput } from "./item.types.js";

/**
 * Persistence boundary. The service layer only talks to this interface —
 * nothing above the repository imports mongoose.
 */
export interface IItemRepository {
  create(input: CreateItemInput): Promise<Item>;
  update(id: string, ownerId: string, patch: UpdateItemInput): Promise<Item | null>;
  delete(id: string, ownerId: string): Promise<boolean>;
  findById(id: string): Promise<Item | null>;
  list(filter: ListItemsFilter): Promise<Paginated<Item>>;
  incrementInterestsCount(id: string, delta: number): Promise<void>;
}

type PopulatedOwner = {
  _id: Types.ObjectId;
  name: string;
  hostelName: string;
  department: string;
  avatarUrl?: string;
};

const toPublic = (doc: ItemDoc, owner: PopulatedOwner | null): Item => ({
  id: doc._id.toString(),
  title: doc.title,
  description: doc.description,
  price: doc.price,
  category: doc.category as Item["category"],
  condition: doc.condition as Item["condition"],
  status: doc.status as Item["status"],
  hostelName: doc.hostelName,
  images: doc.images ?? [],
  interestsCount: doc.interestsCount ?? 0,
  author: owner
    ? {
        id: owner._id.toString(),
        name: owner.name,
        hostelName: owner.hostelName,
        department: owner.department,
        avatarUrl: owner.avatarUrl,
      }
    : {
        id: doc.owner.toString(),
        name: "Unknown",
        hostelName: doc.hostelName,
        department: "",
      },
  createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
  updatedAt: doc.updatedAt?.toISOString?.() ?? new Date().toISOString(),
});

const loadOwner = async (ownerId: Types.ObjectId): Promise<PopulatedOwner | null> => {
  const doc = await UserModel.findById(ownerId)
    .select("name hostelName department avatarUrl")
    .lean<PopulatedOwner>()
    .exec();
  return doc;
};

export class ItemRepository implements IItemRepository {
  async create(input: CreateItemInput): Promise<Item> {
    const doc = (await ItemModel.create({
      owner: new Types.ObjectId(input.ownerId),
      title: input.title,
      description: input.description,
      price: input.price,
      category: input.category,
      condition: input.condition,
      hostelName: input.hostelName,
      images: input.images ?? [],
    })) as unknown as ItemDoc;
    const owner = await loadOwner(doc.owner);
    return toPublic(doc, owner);
  }

  async update(id: string, ownerId: string, patch: UpdateItemInput): Promise<Item | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = (await ItemModel.findOneAndUpdate(
      { _id: id, owner: new Types.ObjectId(ownerId) },
      { $set: patch },
      { new: true, runValidators: true },
    ).exec()) as unknown as ItemDoc | null;
    if (!doc) return null;
    const owner = await loadOwner(doc.owner);
    return toPublic(doc, owner);
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await ItemModel.deleteOne({
      _id: id,
      owner: new Types.ObjectId(ownerId),
    }).exec();
    return res.deletedCount === 1;
  }

  async findById(id: string): Promise<Item | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = (await ItemModel.findById(id).lean().exec()) as unknown as ItemDoc | null;
    if (!doc) return null;
    const owner = await loadOwner(doc.owner);
    return toPublic(doc, owner);
  }

  async list(filter: ListItemsFilter): Promise<Paginated<Item>> {
    const query: FilterQuery<ItemDoc> = {};
    if (filter.category) query.category = filter.category;
    if (filter.hostelName) query.hostelName = filter.hostelName;
    if (filter.status) query.status = filter.status;
    else query.status = "active";
    if (filter.ownerId) query.owner = new Types.ObjectId(filter.ownerId);
    if (filter.q) query.$text = { $search: filter.q };

    const skip = (filter.page - 1) * filter.pageSize;

    // "Nearest first" goes through aggregation so we can compute a distance
    // bucket per doc. Otherwise use the simpler find/sort path which is
    // served directly by the (hostelName, createdAt) compound index.
    const docs: ItemDoc[] = filter.nearHostel
      ? await this.listNearHostel(query, filter.nearHostel, skip, filter.pageSize)
      : ((await ItemModel.find(query)
          .sort(filter.q ? { score: { $meta: "textScore" }, createdAt: -1 } : { createdAt: -1 })
          .skip(skip)
          .limit(filter.pageSize)
          .lean()
          .exec()) as unknown as ItemDoc[]);

    const total = await ItemModel.countDocuments(query).exec();

    const ownerIds = Array.from(new Set(docs.map((d) => d.owner.toString())));
    const owners = ownerIds.length
      ? await UserModel.find({ _id: { $in: ownerIds } })
          .select("name hostelName department avatarUrl")
          .lean<PopulatedOwner[]>()
          .exec()
      : [];
    const ownerMap = new Map(owners.map((o) => [o._id.toString(), o]));

    return {
      items: docs.map((d) => toPublic(d, ownerMap.get(d.owner.toString()) ?? null)),
      page: filter.page,
      pageSize: filter.pageSize,
      total,
    };
  }

  /**
   * Distance-sorted listing. Uses a $switch expression fed from the in-memory
   * hostel catalog to assign each doc a 0/1/2 bucket (same hostel, same zone,
   * other) and then sorts by (distance asc, createdAt desc).
   *
   * The initial $match still leverages indexes (status, category, hostelName).
   */
  private async listNearHostel(
    query: FilterQuery<ItemDoc>,
    nearHostel: string,
    skip: number,
    limit: number,
  ): Promise<ItemDoc[]> {
    const anchor = getHostel(nearHostel);
    const sameZone = anchor ? hostelsInZone(anchor.zone).filter((n) => n !== anchor.name) : [];

    const pipeline: PipelineStage[] = [
      { $match: query },
      {
        $addFields: {
          _distance: {
            $switch: {
              branches: [
                { case: { $eq: ["$hostelName", anchor?.name ?? nearHostel] }, then: 0 },
                { case: { $in: ["$hostelName", sameZone] }, then: 1 },
              ],
              default: 2,
            },
          },
        },
      },
      { $sort: { _distance: 1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    return (await ItemModel.aggregate(pipeline).exec()) as unknown as ItemDoc[];
  }

  async incrementInterestsCount(id: string, delta: number): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;
    await ItemModel.updateOne({ _id: id }, { $inc: { interestsCount: delta } }).exec();
  }
}

export const itemRepository = new ItemRepository();
