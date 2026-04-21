import type { Paginated, Requirement } from "@hostely/shared";
import { Types, type FilterQuery } from "mongoose";
import { UserModel } from "../user/user.model.js";
import { RequirementModel, type RequirementDoc } from "./requirement.model.js";
import type { CreateRequirementInput, ListRequirementsFilter } from "./requirement.types.js";

export interface IRequirementRepository {
  create(input: CreateRequirementInput): Promise<Requirement>;
  delete(id: string, ownerId: string): Promise<boolean>;
  findById(id: string): Promise<Requirement | null>;
  list(filter: ListRequirementsFilter): Promise<Paginated<Requirement>>;
}

type PopulatedOwner = {
  _id: Types.ObjectId;
  name: string;
  hostelName: string;
  department: string;
  avatarUrl?: string;
};

const toPublic = (doc: RequirementDoc, owner: PopulatedOwner | null): Requirement => ({
  id: doc._id.toString(),
  title: doc.title,
  description: doc.description,
  category: doc.category as Requirement["category"],
  budgetMax: doc.budgetMax ?? undefined,
  hostelName: doc.hostelName,
  status: doc.status as Requirement["status"],
  author: owner
    ? {
        id: owner._id.toString(),
        name: owner.name,
        hostelName: owner.hostelName,
        department: owner.department,
        avatarUrl: owner.avatarUrl,
      }
    : { id: doc.owner.toString(), name: "Unknown", hostelName: doc.hostelName, department: "" },
  createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
  updatedAt: doc.updatedAt?.toISOString?.() ?? new Date().toISOString(),
});

const loadOwner = async (ownerId: Types.ObjectId): Promise<PopulatedOwner | null> =>
  UserModel.findById(ownerId)
    .select("name hostelName department avatarUrl")
    .lean<PopulatedOwner>()
    .exec();

export class RequirementRepository implements IRequirementRepository {
  async create(input: CreateRequirementInput): Promise<Requirement> {
    const doc = (await RequirementModel.create({
      owner: new Types.ObjectId(input.ownerId),
      title: input.title,
      description: input.description,
      category: input.category,
      budgetMax: input.budgetMax,
      hostelName: input.hostelName,
    })) as unknown as RequirementDoc;
    const owner = await loadOwner(doc.owner);
    return toPublic(doc, owner);
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await RequirementModel.deleteOne({
      _id: id,
      owner: new Types.ObjectId(ownerId),
    }).exec();
    return res.deletedCount === 1;
  }

  async findById(id: string): Promise<Requirement | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = (await RequirementModel.findById(id)
      .lean()
      .exec()) as unknown as RequirementDoc | null;
    if (!doc) return null;
    const owner = await loadOwner(doc.owner);
    return toPublic(doc, owner);
  }

  async list(filter: ListRequirementsFilter): Promise<Paginated<Requirement>> {
    const query: FilterQuery<RequirementDoc> = {};
    if (filter.category) query.category = filter.category;
    if (filter.hostelName) query.hostelName = filter.hostelName;
    if (filter.status) query.status = filter.status;
    else query.status = "open";
    if (filter.ownerId) query.owner = new Types.ObjectId(filter.ownerId);
    if (filter.q) query.$text = { $search: filter.q };

    const skip = (filter.page - 1) * filter.pageSize;
    const [docs, total] = await Promise.all([
      RequirementModel.find(query)
        .sort(filter.q ? { score: { $meta: "textScore" }, createdAt: -1 } : { createdAt: -1 })
        .skip(skip)
        .limit(filter.pageSize)
        .lean()
        .exec() as unknown as Promise<RequirementDoc[]>,
      RequirementModel.countDocuments(query).exec(),
    ]);

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
}

export const requirementRepository = new RequirementRepository();
