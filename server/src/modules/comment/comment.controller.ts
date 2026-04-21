import type { CommentParentType } from "@hostely/shared";
import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { created, ok } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { commentService } from "./comment.service.js";
import type { AddCommentBody } from "./comment.validator.js";

const requireUser = (req: Request): string => {
  if (!req.user) throw AppError.unauthorized();
  return req.user.sub;
};

/** Factory because the parent type is fixed per mount-point. */
export const commentControllerFor = (parentType: CommentParentType) => ({
  add: asyncHandler(async (req: Request, res: Response) => {
    const authorId = requireUser(req);
    const parentId = req.params.id as string;
    const { body } = req.body as AddCommentBody;
    const comment = await commentService.add(parentType, parentId, authorId, body);
    return created(res, { comment });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const parentId = req.params.id as string;
    const comments = await commentService.list(parentType, parentId);
    return ok(res, { comments });
  }),
});

export const commentTopLevelController = {
  remove: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUser(req);
    const commentId = req.params.commentId as string;
    await commentService.delete(commentId, userId);
    res.status(204).end();
  }),
};
