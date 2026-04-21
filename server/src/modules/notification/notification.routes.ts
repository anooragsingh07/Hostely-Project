import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { idParamSchema } from "../item/item.validator.js";
import { notificationController } from "./notification.controller.js";

const router = Router();

router.get("/", requireAuth, notificationController.list);
router.post("/read-all", requireAuth, notificationController.markAllRead);
router.patch(
  "/:id/read",
  requireAuth,
  validate(idParamSchema, "params"),
  notificationController.markRead,
);

export { router as notificationRouter };
