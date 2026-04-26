import { ROLES } from "@hostely/shared";
import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { adminController } from "./admin.controller.js";
import {
  adminListChatThreadsQuerySchema,
  adminListItemsQuerySchema,
  adminListRequirementsQuerySchema,
  adminListUsersQuerySchema,
  adminPatchUserSchema,
  adminPurgeChatThreadSchema,
  adminResetPasswordSchema,
  adminUpdateItemSchema,
  adminUpdateRequirementSchema,
  commentIdParamSchema,
  itemIdParamSchema,
  messageIdParamSchema,
  requirementIdParamSchema,
  userIdParamSchema,
} from "./admin.validator.js";

const router = Router();

router.use(requireAuth, requireRole(ROLES.ADMIN));

router.get("/analytics", adminController.analytics);

router.get("/users", validate(adminListUsersQuerySchema, "query"), adminController.listUsers);
router.patch(
  "/users/:id",
  validate(userIdParamSchema, "params"),
  validate(adminPatchUserSchema),
  adminController.patchUser,
);
router.post(
  "/users/:id/reset-password",
  validate(userIdParamSchema, "params"),
  validate(adminResetPasswordSchema),
  adminController.resetUserPassword,
);

router.get(
  "/requirements",
  validate(adminListRequirementsQuerySchema, "query"),
  adminController.listRequirements,
);
router.patch(
  "/requirements/:id",
  validate(requirementIdParamSchema, "params"),
  validate(adminUpdateRequirementSchema),
  adminController.updateRequirement,
);
router.post(
  "/requirements/:id/remove",
  validate(requirementIdParamSchema, "params"),
  adminController.removeRequirement,
);
router.post(
  "/requirements/:id/restore",
  validate(requirementIdParamSchema, "params"),
  adminController.restoreRequirement,
);

router.get("/items", validate(adminListItemsQuerySchema, "query"), adminController.listItems);
router.patch(
  "/items/:id",
  validate(itemIdParamSchema, "params"),
  validate(adminUpdateItemSchema),
  adminController.updateItem,
);
router.post("/items/:id/remove", validate(itemIdParamSchema, "params"), adminController.removeItem);
router.post(
  "/items/:id/restore",
  validate(itemIdParamSchema, "params"),
  adminController.restoreItem,
);

router.delete(
  "/comments/:commentId",
  validate(commentIdParamSchema, "params"),
  adminController.deleteComment,
);

router.get(
  "/chat/threads",
  validate(adminListChatThreadsQuerySchema, "query"),
  adminController.listChatThreads,
);
router.delete(
  "/chat/messages/:id",
  validate(messageIdParamSchema, "params"),
  adminController.deleteChatMessage,
);
router.post(
  "/chat/threads/purge",
  validate(adminPurgeChatThreadSchema),
  adminController.purgeChatThread,
);

export { router as adminRouter };
