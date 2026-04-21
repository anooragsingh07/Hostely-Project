/**
 * Marketplace category. Seed values come from the hardcoded
 * `ITEM_CATEGORIES` list; admins can add new entries at runtime.
 * `active: false` means the slug is retired — existing items keep
 * the value but no new listings can pick it.
 */
export interface Category {
  id: string;
  /** URL-safe unique identifier, e.g. "books". Stored on items/requirements. */
  slug: string;
  /** Human-facing display label, e.g. "Books". */
  label: string;
  /** Whether the category is offered to users for new listings. */
  active: boolean;
  /** True for categories seeded from ITEM_CATEGORIES — the admin cannot hard-delete these. */
  seeded: boolean;
  createdAt: string;
  updatedAt: string;
}
