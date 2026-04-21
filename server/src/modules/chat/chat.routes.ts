import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { chatController } from "./chat.controller.js";
import { peerParamSchema, sendMessageSchema } from "./chat.validator.js";

const router = Router();

router.get("/conversations", requireAuth, chatController.conversations);
router.post("/messages", requireAuth, validate(sendMessageSchema), chatController.send);
router.get(
  "/threads/:peerId",
  requireAuth,
  validate(peerParamSchema, "params"),
  chatController.thread,
);
router.post(
  "/threads/:peerId/read",
  requireAuth,
  validate(peerParamSchema, "params"),
  chatController.read,
);

export { router as chatRouter };
