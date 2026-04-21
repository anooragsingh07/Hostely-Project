import { ROLES } from "@hostely/shared";
import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { categoryController } from "./category.controller.js";
import { createCategorySchema, slugParamSchema } from "./category.validator.js";

const router = Router();

/**
 * Public-ish read — still auth'd so we can attribute abuse, but any
 * signed-in student needs the list to fill filter/form dropdowns.
 */
router.get("/", requireAuth, categoryController.listPublic);

router.get("/all", requireAuth, requireRole(ROLES.ADMIN), categoryController.listAll);

router.post(
  "/",
  requireAuth,
  requireRole(ROLES.ADMIN),
  validate(createCategorySchema),
  categoryController.create,
);

router.delete(
  "/:slug",
  requireAuth,
  requireRole(ROLES.ADMIN),
  validate(slugParamSchema, "params"),
  categoryController.remove,
);

router.post(
  "/:slug/restore",
  requireAuth,
  requireRole(ROLES.ADMIN),
  validate(slugParamSchema, "params"),
  categoryController.restore,
);

export { router as categoryRouter };
