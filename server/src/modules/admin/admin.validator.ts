import {
  ITEM_STATUSES,
  MARKETPLACE_LIMITS,
  REQUIREMENT_STATUSES,
  ROLES,
  VALIDATION,
} from "@hostely/shared";
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

export const userIdParamSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i, "Invalid id"),
});
export type UserIdParam = z.infer<typeof userIdParamSchema>;

export const adminListUsersQuerySchema = z.object({
  q: z.string().trim().min(1).max(120).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .max(MARKETPLACE_LIMITS.PAGE_SIZE_MAX)
    .default(MARKETPLACE_LIMITS.PAGE_SIZE_DEFAULT),
});
export type AdminListUsersQuery = z.infer<typeof adminListUsersQuerySchema>;

export const adminPatchUserSchema = z
  .object({
    role: z.enum([ROLES.STUDENT, ROLES.ADMIN]).optional(),
    banned: z.boolean().optional(),
  })
  .refine((o) => o.role !== undefined || o.banned !== undefined, {
    message: "Provide role and/or banned",
  });
export type AdminPatchUserBody = z.infer<typeof adminPatchUserSchema>;

const passwordField = z
  .string()
  .min(VALIDATION.PASSWORD_MIN, `At least ${VALIDATION.PASSWORD_MIN} characters`)
  .max(VALIDATION.PASSWORD_MAX)
  .regex(/[A-Za-z]/, "Must contain a letter")
  .regex(/[0-9]/, "Must contain a number");

export const adminResetPasswordSchema = z.object({
  newPassword: passwordField,
});
export type AdminResetPasswordBody = z.infer<typeof adminResetPasswordSchema>;

const categoryField = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(40)
  .regex(/^[a-z0-9-]+$/, "Invalid category");

const titleField = z
  .string()
  .trim()
  .min(MARKETPLACE_LIMITS.TITLE_MIN)
  .max(MARKETPLACE_LIMITS.TITLE_MAX);
const descriptionField = z
  .string()
  .trim()
  .min(MARKETPLACE_LIMITS.DESCRIPTION_MIN)
  .max(MARKETPLACE_LIMITS.DESCRIPTION_MAX);

export const adminUpdateItemSchema = z
  .object({
    title: titleField.optional(),
    description: descriptionField.optional(),
    price: z
      .number()
      .int()
      .min(MARKETPLACE_LIMITS.PRICE_MIN)
      .max(MARKETPLACE_LIMITS.PRICE_MAX)
      .optional(),
    category: categoryField.optional(),
    condition: z.enum(["new", "like-new", "good", "fair"]).optional(),
    status: z.enum(ITEM_STATUSES).optional(),
    images: z.array(z.string().url()).max(MARKETPLACE_LIMITS.IMAGES_MAX).optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: "Nothing to update" });
export type AdminUpdateItemBody = z.infer<typeof adminUpdateItemSchema>;

export const adminListRequirementsQuerySchema = z.object({
  q: z.string().trim().min(1).max(120).optional(),
  category: categoryField.optional(),
  hostelName: z.string().trim().min(2).max(80).optional(),
  status: z.enum(REQUIREMENT_STATUSES).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .max(MARKETPLACE_LIMITS.PAGE_SIZE_MAX)
    .default(MARKETPLACE_LIMITS.PAGE_SIZE_DEFAULT),
});
export type AdminListRequirementsQuery = z.infer<typeof adminListRequirementsQuerySchema>;

export const requirementIdParamSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i, "Invalid id"),
});
export type RequirementIdParam = z.infer<typeof requirementIdParamSchema>;

export const adminUpdateRequirementSchema = z
  .object({
    title: titleField.optional(),
    description: descriptionField.optional(),
    category: categoryField.optional(),
    budgetMax: z
      .number()
      .int()
      .min(MARKETPLACE_LIMITS.PRICE_MIN)
      .max(MARKETPLACE_LIMITS.PRICE_MAX)
      .optional(),
    hostelName: z.string().trim().min(2).max(80).optional(),
    status: z.enum(REQUIREMENT_STATUSES).optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: "Nothing to update" });
export type AdminUpdateRequirementBody = z.infer<typeof adminUpdateRequirementSchema>;

export const commentIdParamSchema = z.object({
  commentId: z.string().regex(/^[a-f0-9]{24}$/i, "Invalid id"),
});
export type CommentIdParam = z.infer<typeof commentIdParamSchema>;

export const messageIdParamSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i, "Invalid id"),
});
export type MessageIdParam = z.infer<typeof messageIdParamSchema>;

export const adminPurgeChatThreadSchema = z.object({
  userA: z.string().regex(/^[a-f0-9]{24}$/i, "Invalid user id"),
  userB: z.string().regex(/^[a-f0-9]{24}$/i, "Invalid user id"),
});
export type AdminPurgeChatThreadBody = z.infer<typeof adminPurgeChatThreadSchema>;

export const adminListChatThreadsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});
export type AdminListChatThreadsQuery = z.infer<typeof adminListChatThreadsQuerySchema>;
