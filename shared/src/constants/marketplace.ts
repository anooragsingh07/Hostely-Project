/**
 * Marketplace domain constants — shared between server validation,
 * client forms, and filter UI so there's a single source of truth.
 */

/**
 * Baseline categories seeded into the Category collection on first boot.
 * The *runtime* catalog is dynamic — admins can add/retire slugs through
 * the admin panel — so `ItemCategory` is a plain string alias. This list
 * is still useful for seeding, default filter dropdowns when the server
 * is unreachable, and documentation.
 */
export const ITEM_CATEGORIES = [
  "books",
  "electronics",
  "mobility",
  "home",
  "clothing",
  "stationery",
  "other",
] as const;
/** Intentionally wide: the DB stores whatever slugs the admin has approved. */
export type ItemCategory = string;
/** The seed-only union — used where a compile-time list of baseline slugs helps. */
export type SeedItemCategory = (typeof ITEM_CATEGORIES)[number];

export const ITEM_CONDITIONS = ["new", "like-new", "good", "fair"] as const;
export type ItemCondition = (typeof ITEM_CONDITIONS)[number];

/**
 * `removed` is set by admin moderation — the owner-facing UI keeps
 * showing the listing as "taken down" while feeds/search skip it.
 * Owners can still see it in their Sell dashboard for transparency.
 */
export const ITEM_STATUSES = ["active", "sold", "withdrawn", "removed"] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const REQUIREMENT_STATUSES = ["open", "fulfilled", "closed"] as const;
export type RequirementStatus = (typeof REQUIREMENT_STATUSES)[number];

/** Parent surfaces a comment can attach to. */
export const COMMENT_PARENT_TYPES = ["item", "requirement"] as const;
export type CommentParentType = (typeof COMMENT_PARENT_TYPES)[number];

/** Length + pagination limits shared by client forms and server schemas. */
export const MARKETPLACE_LIMITS = {
  TITLE_MIN: 3,
  TITLE_MAX: 120,
  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 2000,
  COMMENT_MIN: 1,
  COMMENT_MAX: 500,
  INTEREST_NOTE_MAX: 280,
  PRICE_MIN: 0,
  PRICE_MAX: 10_000_000,
  IMAGES_MAX: 6,
  PAGE_SIZE_DEFAULT: 20,
  PAGE_SIZE_MAX: 50,
} as const;
