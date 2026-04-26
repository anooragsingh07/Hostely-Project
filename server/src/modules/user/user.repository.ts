import type { Role } from "@hostely/shared";
import { Types, type FilterQuery } from "mongoose";
import { UserModel, type UserDoc } from "./user.model.js";
import type { CreateUserInput, PublicUser } from "./user.types.js";

/**
 * Persistence boundary. Services depend on this interface, not Mongoose.
 * Swapping to Prisma/Postgres would touch only this file.
 */
export interface IUserRepository {
  create(input: CreateUserInput): Promise<PublicUser>;
  findByEmailWithPassword(email: string): Promise<(UserDoc & { passwordHash: string }) | null>;
  findByRollNoWithPassword(rollNo: string): Promise<(UserDoc & { passwordHash: string }) | null>;
  findById(id: string): Promise<PublicUser | null>;
  existsByEmailOrRollNo(email: string, rollNo: string): Promise<boolean>;
  listPaginated(params: {
    page: number;
    pageSize: number;
    q?: string;
  }): Promise<{ users: PublicUser[]; total: number }>;
  updateAdminFields(
    id: string,
    patch: { role?: Role; banned?: boolean },
  ): Promise<PublicUser | null>;
  setPasswordHash(id: string, passwordHash: string): Promise<boolean>;
  countByRole(role: Role): Promise<number>;
}

const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toPublic = (doc: UserDoc): PublicUser => ({
  id: doc.id as string,
  name: doc.name,
  email: doc.email,
  rollNo: doc.rollNo,
  department: doc.department,
  hostelName: doc.hostelName,
  role: doc.role as PublicUser["role"],
  banned: Boolean(doc.banned),
  avatarUrl: doc.avatarUrl ?? undefined,
  createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
  updatedAt: doc.updatedAt?.toISOString?.() ?? new Date().toISOString(),
});

export class UserRepository implements IUserRepository {
  async create(input: CreateUserInput): Promise<PublicUser> {
    const doc = (await UserModel.create(input)) as unknown as UserDoc;
    return toPublic(doc);
  }

  async findByEmailWithPassword(email: string) {
    return UserModel.findOne({ email: email.toLowerCase() })
      .select("+passwordHash")
      .exec() as Promise<(UserDoc & { passwordHash: string }) | null>;
  }

  async findByRollNoWithPassword(rollNo: string) {
    return UserModel.findOne({ rollNo: rollNo.toUpperCase() })
      .select("+passwordHash")
      .exec() as Promise<(UserDoc & { passwordHash: string }) | null>;
  }

  async findById(id: string): Promise<PublicUser | null> {
    const doc = (await UserModel.findById(id).exec()) as unknown as UserDoc | null;
    return doc ? toPublic(doc) : null;
  }

  async existsByEmailOrRollNo(email: string, rollNo: string): Promise<boolean> {
    const hit = await UserModel.exists({
      $or: [{ email: email.toLowerCase() }, { rollNo: rollNo.toUpperCase() }],
    }).exec();
    return Boolean(hit);
  }

  async listPaginated(params: {
    page: number;
    pageSize: number;
    q?: string;
  }): Promise<{ users: PublicUser[]; total: number }> {
    const filter: FilterQuery<UserDoc> = {};
    const q = params.q?.trim();
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ name: rx }, { email: rx }, { rollNo: rx }];
    }
    const skip = (params.page - 1) * params.pageSize;
    const [docs, total] = await Promise.all([
      UserModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(params.pageSize)
        .exec() as Promise<UserDoc[]>,
      UserModel.countDocuments(filter).exec(),
    ]);
    return { users: docs.map(toPublic), total };
  }

  async updateAdminFields(
    id: string,
    patch: { role?: Role; banned?: boolean },
  ): Promise<PublicUser | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = (await UserModel.findByIdAndUpdate(
      id,
      { $set: patch },
      { new: true, runValidators: true },
    ).exec()) as unknown as UserDoc | null;
    return doc ? toPublic(doc) : null;
  }

  async setPasswordHash(id: string, passwordHash: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await UserModel.updateOne({ _id: id }, { $set: { passwordHash } }).exec();
    return res.modifiedCount === 1;
  }

  async countByRole(role: Role): Promise<number> {
    return UserModel.countDocuments({ role }).exec();
  }
}

export const userRepository = new UserRepository();
