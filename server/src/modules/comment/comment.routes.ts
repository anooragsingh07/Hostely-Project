import type { CommentParentType } from "@hostely/shared";
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { idParamSchema } from "../item/item.validator.js";
import { commentControllerFor, commentTopLevelController } from "./comment.controller.js";
import { addCommentSchema, commentIdParamSchema } from "./comment.validator.js";

/**
 * Nested sub-router used under `/items/:id/comments` and
 * `/requirements/:id/comments`. The parent type is baked in at mount-time.
 */
export const commentRouter = (parentType: CommentParentType): Router => {
  const router = Router({ mergeParams: true });
  const controller = commentControllerFor(parentType);

  router.get("/", requireAuth, validate(idParamSchema, "params"), controller.list);
  router.post(
    "/",
    requireAuth,
    validate(idParamSchema, "params"),
    validate(addCommentSchema),
    controller.add,
  );
  return router;
};

/** Top-level `/comments/:commentId` — deletion by author only. */
export const commentTopLevelRouter = Router();
commentTopLevelRouter.delete(
  "/:commentId",
  requireAuth,
  validate(commentIdParamSchema, "params"),
  commentTopLevelController.remove,
);
