import type { CommentParentType } from "@hostely/shared";
import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { created, ok } from "../../utils/apiResponse.js";
import { requireUserId } from "../../utils/requireUser.js";
import { commentService } from "./comment.service.js";
import type { AddCommentBody } from "./comment.validator.js";

/** Factory because the parent type is fixed per mount-point. */
export const commentControllerFor = (parentType: CommentParentType) => ({
  add: asyncHandler(async (req: Request, res: Response) => {
    const authorId = requireUserId(req);
    const parentId = req.params.id as string;
    const { body } = req.body as AddCommentBody;
    const comment = await commentService.add(parentType, parentId, authorId, body);
    return created(res, { comment });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const parentId = req.params.id as string;
    const viewerId = requireUserId(req);
    const comments = await commentService.list(parentType, parentId, viewerId);
    return ok(res, { comments });
  }),
});

export const commentTopLevelController = {
  remove: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const commentId = req.params.commentId as string;
    await commentService.delete(commentId, userId);
    res.status(204).end();
  }),
};
