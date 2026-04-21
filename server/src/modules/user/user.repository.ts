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
}

const toPublic = (doc: UserDoc): PublicUser => ({
  id: doc.id as string,
  name: doc.name,
  email: doc.email,
  rollNo: doc.rollNo,
  department: doc.department,
  hostelName: doc.hostelName,
  role: doc.role as PublicUser["role"],
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
}

export const userRepository = new UserRepository();
