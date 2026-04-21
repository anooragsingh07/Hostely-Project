import { ITEM_CATEGORIES, ITEM_CONDITIONS, MARKETPLACE_LIMITS } from "@hostely/shared";
import { z } from "zod";

/** Shared listing form schema — same rules the server will re-apply. */
export const listingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(MARKETPLACE_LIMITS.TITLE_MIN, "Title too short")
    .max(MARKETPLACE_LIMITS.TITLE_MAX, "Title too long"),
  description: z
    .string()
    .trim()
    .min(MARKETPLACE_LIMITS.DESCRIPTION_MIN, "Add a little more detail")
    .max(MARKETPLACE_LIMITS.DESCRIPTION_MAX, "Description too long"),
  price: z.coerce
    .number({ invalid_type_error: "Price is required" })
    .int("Whole rupees only")
    .min(MARKETPLACE_LIMITS.PRICE_MIN, "Price can't be negative")
    .max(MARKETPLACE_LIMITS.PRICE_MAX, "Price is too high"),
  category: z.enum(ITEM_CATEGORIES, { required_error: "Pick a category" }),
  condition: z.enum(ITEM_CONDITIONS, { required_error: "Pick a condition" }),
  hostelName: z.string().trim().max(80).optional(),
});
export type ListingValues = z.infer<typeof listingSchema>;

export const requirementFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(MARKETPLACE_LIMITS.TITLE_MIN, "Title too short")
    .max(MARKETPLACE_LIMITS.TITLE_MAX),
  description: z
    .string()
    .trim()
    .min(MARKETPLACE_LIMITS.DESCRIPTION_MIN, "Add a bit more detail")
    .max(MARKETPLACE_LIMITS.DESCRIPTION_MAX),
  category: z.enum(ITEM_CATEGORIES, { required_error: "Pick a category" }),
  budgetMax: z
    .union([
      z.literal(""),
      z.coerce.number().int().min(MARKETPLACE_LIMITS.PRICE_MIN).max(MARKETPLACE_LIMITS.PRICE_MAX),
    ])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
  hostelName: z.string().trim().max(80).optional(),
});
export type RequirementFormValues = z.infer<typeof requirementFormSchema>;
