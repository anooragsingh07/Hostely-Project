import {
  HOSTEL_NAMES,
  ITEM_CATEGORIES,
  ITEM_CONDITIONS,
  ITEM_STATUSES,
  MARKETPLACE_LIMITS,
} from "@hostely/shared";
import { z } from "zod";

/**
 * Hostel field. We accept both the canonical name and a legacy free string
 * of reasonable length — the service normalizes it through `getHostel()`
 * before persisting, falling back to the owner's profile hostel.
 */
const hostelField = z.string().trim().min(2, "Hostel required").max(80, "Hostel too long");

const titleField = z
  .string()
  .trim()
  .min(MARKETPLACE_LIMITS.TITLE_MIN, "Title too short")
  .max(MARKETPLACE_LIMITS.TITLE_MAX, "Title too long");

const descriptionField = z
  .string()
  .trim()
  .min(MARKETPLACE_LIMITS.DESCRIPTION_MIN, "Description too short")
  .max(MARKETPLACE_LIMITS.DESCRIPTION_MAX, "Description too long");

const priceField = z
  .number()
  .int("Price must be a whole number")
  .min(MARKETPLACE_LIMITS.PRICE_MIN)
  .max(MARKETPLACE_LIMITS.PRICE_MAX);

const imagesField = z
  .array(z.string().url("Image must be a URL"))
  .max(MARKETPLACE_LIMITS.IMAGES_MAX, `At most ${MARKETPLACE_LIMITS.IMAGES_MAX} images`)
  .optional();

export const createItemSchema = z.object({
  title: titleField,
  description: descriptionField,
  price: priceField,
  category: z.enum(ITEM_CATEGORIES),
  condition: z.enum(ITEM_CONDITIONS),
  hostelName: hostelField.optional(),
  images: imagesField,
});
export type CreateItemBody = z.infer<typeof createItemSchema>;

export const updateItemSchema = z
  .object({
    title: titleField.optional(),
    description: descriptionField.optional(),
    price: priceField.optional(),
    category: z.enum(ITEM_CATEGORIES).optional(),
    condition: z.enum(ITEM_CONDITIONS).optional(),
    status: z.enum(ITEM_STATUSES).optional(),
    images: imagesField,
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: "Nothing to update" });
export type UpdateItemBody = z.infer<typeof updateItemSchema>;

const boolQuery = z
  .union([z.literal("true"), z.literal("false"), z.literal("1"), z.literal("0")])
  .transform((v) => v === "true" || v === "1")
  .optional();

export const listItemsQuerySchema = z.object({
  q: z.string().trim().min(1).max(120).optional(),
  category: z.enum(ITEM_CATEGORIES).optional(),
  hostelName: hostelField.optional(),
  /** Anchor hostel for "nearest first" sort. Independent of filter. */
  nearHostel: hostelField.optional(),
  status: z.enum(ITEM_STATUSES).optional(),
  mine: boolQuery,
  /** Explicit request to sort by proximity. Implies use-my-hostel when no anchor is given. */
  sortByHostel: boolQuery,
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .max(MARKETPLACE_LIMITS.PAGE_SIZE_MAX)
    .default(MARKETPLACE_LIMITS.PAGE_SIZE_DEFAULT),
});
export type ListItemsQuery = z.infer<typeof listItemsQuerySchema>;

/** Exposed so the client can keep its dropdown in sync with the canonical list. */
export const LISTABLE_HOSTELS = HOSTEL_NAMES;

export const idParamSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i, "Invalid id"),
});
export type IdParam = z.infer<typeof idParamSchema>;
