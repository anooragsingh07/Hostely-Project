import { ROLES } from "@hostely/shared";
import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { adminController } from "./admin.controller.js";
import { adminListItemsQuerySchema, itemIdParamSchema } from "./admin.validator.js";

const router = Router();

/**
 * Every admin route is guarded by `requireAuth` + `requireRole(ADMIN)`.
 * The controller never sees unauthenticated or under-privileged traffic.
 */
router.use(requireAuth, requireRole(ROLES.ADMIN));

router.get("/analytics", adminController.analytics);

router.get("/items", validate(adminListItemsQuerySchema, "query"), adminController.listItems);

router.post("/items/:id/remove", validate(itemIdParamSchema, "params"), adminController.removeItem);

router.post(
  "/items/:id/restore",
  validate(itemIdParamSchema, "params"),
  adminController.restoreItem,
);

export { router as adminRouter };
