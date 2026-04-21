import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { idParamSchema } from "../item/item.validator.js";
import { interestController } from "./interest.controller.js";
import { markInterestSchema } from "./interest.validator.js";

/**
 * Nested under /items/:id — each interest belongs to exactly one item.
 * `mergeParams` lets us read `:id` from the parent route.
 */
const router = Router({ mergeParams: true });

router.get("/", requireAuth, validate(idParamSchema, "params"), interestController.list);
router.get("/me", requireAuth, validate(idParamSchema, "params"), interestController.mine);
router.post(
  "/",
  requireAuth,
  validate(idParamSchema, "params"),
  validate(markInterestSchema),
  interestController.mark,
);
router.delete("/", requireAuth, validate(idParamSchema, "params"), interestController.unmark);

export { router as interestRouter };
