import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { commentRouter } from "../comment/comment.routes.js";
import { idParamSchema } from "../item/item.validator.js";
import { requirementController } from "./requirement.controller.js";
import { createRequirementSchema, listRequirementsQuerySchema } from "./requirement.validator.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  validate(listRequirementsQuerySchema, "query"),
  requirementController.list,
);
router.post("/", requireAuth, validate(createRequirementSchema), requirementController.create);

router.get("/:id", requireAuth, validate(idParamSchema, "params"), requirementController.get);
router.delete("/:id", requireAuth, validate(idParamSchema, "params"), requirementController.remove);

router.use("/:id/comments", commentRouter("requirement"));

export { router as requirementRouter };
