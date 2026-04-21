import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { commentTopLevelRouter } from "../modules/comment/comment.routes.js";
import { itemRouter } from "../modules/item/item.routes.js";
import { requirementRouter } from "../modules/requirement/requirement.routes.js";

/** Mount point for every versioned API route. Add new modules here. */
const api = Router();

api.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", uptime: process.uptime() } });
});

api.use("/auth", authRouter);
api.use("/items", itemRouter);
api.use("/requirements", requirementRouter);
api.use("/comments", commentTopLevelRouter);

export { api as apiRouter };
