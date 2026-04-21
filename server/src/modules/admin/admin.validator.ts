import { ITEM_STATUSES, MARKETPLACE_LIMITS } from "@hostely/shared";
import { z } from "zod";

export const adminListItemsQuerySchema = z.object({
  q: z.string().trim().min(1).max(120).optional(),
  category: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  hostelName: z.string().trim().min(2).max(80).optional(),
  status: z.enum(ITEM_STATUSES).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .max(MARKETPLACE_LIMITS.PAGE_SIZE_MAX)
    .default(MARKETPLACE_LIMITS.PAGE_SIZE_DEFAULT),
});
export type AdminListItemsQuery = z.infer<typeof adminListItemsQuerySchema>;

export const itemIdParamSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i, "Invalid id"),
});
export type ItemIdParam = z.infer<typeof itemIdParamSchema>;
