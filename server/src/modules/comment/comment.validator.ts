import { MARKETPLACE_LIMITS } from "@hostely/shared";
import { z } from "zod";

export const addCommentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(MARKETPLACE_LIMITS.COMMENT_MIN, "Can't be empty")
    .max(MARKETPLACE_LIMITS.COMMENT_MAX, "Too long"),
});
export type AddCommentBody = z.infer<typeof addCommentSchema>;

export const commentIdParamSchema = z.object({
  commentId: z.string().regex(/^[a-f0-9]{24}$/i, "Invalid id"),
});
export type CommentIdParam = z.infer<typeof commentIdParamSchema>;
