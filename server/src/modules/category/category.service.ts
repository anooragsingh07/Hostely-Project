import { ITEM_CATEGORIES, type Category } from "@hostely/shared";
import { AppError } from "../../utils/AppError.js";
import { logger } from "../../utils/logger.js";
import { categoryRepository, type ICategoryRepository } from "./category.repository.js";

/**
 * Category service — owns the read-through cache of active slugs so item
 * and requirement validators can reject unknown values without hitting
 * Mongo per request. The cache is invalidated on any mutation.
 */
export class CategoryService {
  /** TTL keeps the cache eventually-consistent across horizontally-scaled nodes. */
  private static readonly CACHE_TTL_MS = 60_000;

  private cache: Set<string> | null = null;
  private cacheExpiresAt = 0;

  constructor(private readonly repo: ICategoryRepository = categoryRepository) {}

  /** Insert any missing ITEM_CATEGORIES rows — safe to call on every boot. */
  async seed(): Promise<void> {
    await Promise.all(
      ITEM_CATEGORIES.map((slug) => this.repo.upsertSeeded(slug, this.labelFor(slug))),
    );
    this.invalidate();
    logger.info("Category seed ensured", { count: ITEM_CATEGORIES.length });
  }

  async listActive(): Promise<Category[]> {
    return this.repo.list(false);
  }

  async listAll(): Promise<Category[]> {
    return this.repo.list(true);
  }

  async create(input: { slug: string; label: string; createdBy?: string }): Promise<Category> {
    const slug = this.normalizeSlug(input.slug);
    const existing = await this.repo.findBySlug(slug);
    if (existing) throw AppError.conflict("Category already exists");
    const created = await this.repo.create({
      slug,
      label: input.label.trim(),
      createdBy: input.createdBy,
    });
    this.invalidate();
    return created;
  }

  /**
   * Retire a category. Seeded rows are deactivated (soft), admin-created
   * ones are hard-deleted — keeps the audit trail lean without orphaning
   * historic items labeled with a seed slug.
   */
  async remove(slug: string): Promise<Category | null> {
    const normalized = this.normalizeSlug(slug);
    const existing = await this.repo.findBySlug(normalized);
    if (!existing) throw AppError.notFound("Category not found");

    if (existing.seeded) {
      const updated = await this.repo.setActive(normalized, false);
      this.invalidate();
      return updated;
    }

    await this.repo.deleteNonSeeded(normalized);
    this.invalidate();
    return null;
  }

  async restore(slug: string): Promise<Category> {
    const normalized = this.normalizeSlug(slug);
    const updated = await this.repo.setActive(normalized, true);
    if (!updated) throw AppError.notFound("Category not found");
    this.invalidate();
    return updated;
  }

  /**
   * Validator path — cheap check of an incoming slug against the cached
   * active set. Missing / stale cache is refilled transparently.
   */
  async assertActive(slug: string): Promise<void> {
    const ok = (await this.getActiveSlugSet()).has(slug);
    if (!ok) throw AppError.badRequest(`Unknown category: ${slug}`);
  }

  async getActiveSlugSet(): Promise<Set<string>> {
    const now = Date.now();
    if (this.cache && now < this.cacheExpiresAt) return this.cache;
    const slugs = await this.repo.activeSlugs();
    this.cache = new Set(slugs);
    this.cacheExpiresAt = now + CategoryService.CACHE_TTL_MS;
    return this.cache;
  }

  private invalidate(): void {
    this.cache = null;
    this.cacheExpiresAt = 0;
  }

  private normalizeSlug(raw: string): string {
    return raw.trim().toLowerCase();
  }

  /** Turn a kebab/lowercase slug into a human-friendly label for seed rows. */
  private labelFor(slug: string): string {
    return slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
}

export const categoryService = new CategoryService();
