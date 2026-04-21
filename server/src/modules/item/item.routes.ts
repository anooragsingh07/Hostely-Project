import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { commentRouter } from "../comment/comment.routes.js";
import { interestRouter } from "../interest/interest.routes.js";
import { itemController } from "./item.controller.js";
import {
  createItemSchema,
  idParamSchema,
  listItemsQuerySchema,
  updateItemSchema,
} from "./item.validator.js";

const router = Router();

router.get("/", requireAuth, validate(listItemsQuerySchema, "query"), itemController.list);
router.post("/", requireAuth, validate(createItemSchema), itemController.create);

router.get("/:id", requireAuth, validate(idParamSchema, "params"), itemController.get);
router.patch(
  "/:id",
  requireAuth,
  validate(idParamSchema, "params"),
  validate(updateItemSchema),
  itemController.update,
);
router.delete("/:id", requireAuth, validate(idParamSchema, "params"), itemController.remove);

// Nested resources — share the :id param via mergeParams inside each router.
router.use("/:id/interests", interestRouter);
router.use("/:id/comments", commentRouter("item"));

export { router as itemRouter };
