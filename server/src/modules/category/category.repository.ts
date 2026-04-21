import type { Category } from "@hostely/shared";
import { Types } from "mongoose";
import { CategoryModel, type CategoryDoc } from "./category.model.js";

export interface CreateCategoryInput {
  slug: string;
  label: string;
  seeded?: boolean;
  createdBy?: string;
}

export interface ICategoryRepository {
  list(includeInactive?: boolean): Promise<Category[]>;
  findBySlug(slug: string): Promise<Category | null>;
  create(input: CreateCategoryInput): Promise<Category>;
  setActive(slug: string, active: boolean): Promise<Category | null>;
  deleteNonSeeded(slug: string): Promise<boolean>;
  upsertSeeded(slug: string, label: string): Promise<void>;
  activeSlugs(): Promise<string[]>;
}

const toPublic = (doc: CategoryDoc): Category => ({
  id: doc._id.toString(),
  slug: doc.slug,
  label: doc.label,
  active: doc.active ?? true,
  seeded: doc.seeded ?? false,
  createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
  updatedAt: doc.updatedAt?.toISOString?.() ?? new Date().toISOString(),
});

export class CategoryRepository implements ICategoryRepository {
  async list(includeInactive = false): Promise<Category[]> {
    const filter = includeInactive ? {} : { active: true };
    const docs = (await CategoryModel.find(filter)
      .sort({ seeded: -1, label: 1 })
      .lean()
      .exec()) as unknown as CategoryDoc[];
    return docs.map(toPublic);
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const doc = (await CategoryModel.findOne({ slug })
      .lean()
      .exec()) as unknown as CategoryDoc | null;
    return doc ? toPublic(doc) : null;
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const doc = (await CategoryModel.create({
      slug: input.slug,
      label: input.label,
      seeded: input.seeded ?? false,
      createdBy: input.createdBy ? new Types.ObjectId(input.createdBy) : undefined,
    })) as unknown as CategoryDoc;
    return toPublic(doc);
  }

  async setActive(slug: string, active: boolean): Promise<Category | null> {
    const doc = (await CategoryModel.findOneAndUpdate(
      { slug },
      { $set: { active } },
      { new: true },
    ).exec()) as unknown as CategoryDoc | null;
    return doc ? toPublic(doc) : null;
  }

  /**
   * Hard delete — only allowed for admin-created slugs. Seeded rows are
   * deactivated via `setActive` instead so historic items stay labeled.
   */
  async deleteNonSeeded(slug: string): Promise<boolean> {
    const res = await CategoryModel.deleteOne({ slug, seeded: false }).exec();
    return res.deletedCount === 1;
  }

  /** Idempotent seed helper — inserts if missing, leaves existing rows alone. */
  async upsertSeeded(slug: string, label: string): Promise<void> {
    await CategoryModel.updateOne(
      { slug },
      { $setOnInsert: { slug, label, active: true, seeded: true } },
      { upsert: true },
    ).exec();
  }

  async activeSlugs(): Promise<string[]> {
    const docs = (await CategoryModel.find({ active: true })
      .select("slug")
      .lean()
      .exec()) as unknown as Array<{ slug: string }>;
    return docs.map((d) => d.slug);
  }
}

export const categoryRepository = new CategoryRepository();
