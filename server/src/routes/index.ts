import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";

/** Mount point for every versioned API route. Add new modules here. */
const api = Router();

api.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", uptime: process.uptime() } });
});

api.use("/auth", authRouter);

export { api as apiRouter };
