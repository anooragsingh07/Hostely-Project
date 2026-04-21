import { ITEM_CATEGORIES, MARKETPLACE_LIMITS, REQUIREMENT_STATUSES } from "@hostely/shared";
import { z } from "zod";

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

export const createRequirementSchema = z.object({
  title: titleField,
  description: descriptionField,
  category: z.enum(ITEM_CATEGORIES),
  budgetMax: z
    .number()
    .int()
    .min(MARKETPLACE_LIMITS.PRICE_MIN)
    .max(MARKETPLACE_LIMITS.PRICE_MAX)
    .optional(),
  hostelName: z.string().trim().min(2).max(80).optional(),
});
export type CreateRequirementBody = z.infer<typeof createRequirementSchema>;

export const listRequirementsQuerySchema = z.object({
  q: z.string().trim().min(1).max(120).optional(),
  category: z.enum(ITEM_CATEGORIES).optional(),
  hostelName: z.string().trim().min(2).max(80).optional(),
  status: z.enum(REQUIREMENT_STATUSES).optional(),
  mine: z
    .union([z.literal("true"), z.literal("false"), z.literal("1"), z.literal("0")])
    .transform((v) => v === "true" || v === "1")
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .max(MARKETPLACE_LIMITS.PAGE_SIZE_MAX)
    .default(MARKETPLACE_LIMITS.PAGE_SIZE_DEFAULT),
});
export type ListRequirementsQuery = z.infer<typeof listRequirementsQuerySchema>;
