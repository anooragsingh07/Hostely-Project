import { z } from "zod";

/**
 * Slugs stay URL-safe so they can appear directly in filter query strings
 * and on item documents as plain keys.
 */
const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, "Slug too short")
  .max(40, "Slug too long")
  .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, digits, or dashes");

const labelField = z.string().trim().min(2, "Label too short").max(60, "Label too long");

export const createCategorySchema = z.object({
  slug: slugField,
  label: labelField,
});
export type CreateCategoryBody = z.infer<typeof createCategorySchema>;

export const slugParamSchema = z.object({
  slug: slugField,
});
export type SlugParam = z.infer<typeof slugParamSchema>;
