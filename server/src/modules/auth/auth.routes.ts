import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authController } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.validator.js";

const router = Router();

/** Tighter cap on credential endpoints to slow brute-force / credential stuffing. */
const authBurstLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: { code: "RATE_LIMIT", message: "Too many attempts. Try again shortly." },
    });
  },
});

router.post("/register", authBurstLimiter, validate(registerSchema), authController.register);
router.post("/login", authBurstLimiter, validate(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);

export { router as authRouter };
