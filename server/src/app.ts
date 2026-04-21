import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { applySecurityHeaders } from "./config/helmet.js";
import { env } from "./config/env.js";
import { errorMiddleware, notFoundMiddleware } from "./middlewares/error.middleware.js";
import {
  mongoInjectionSanitizer,
  stripNullBytesMiddleware,
} from "./middlewares/sanitize.middleware.js";
import { apiRouter } from "./routes/index.js";

/** Pure factory — no listen(), no DB connect. Easy to test. */
export const createApp = (): Express => {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  applySecurityHeaders(app);
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser());
  app.use(mongoInjectionSanitizer);
  app.use(stripNullBytesMiddleware);

  if (env.NODE_ENV !== "test") {
    app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  }

  // Global rate limit — stricter limits live on auth routes.
  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 400,
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => req.originalUrl.includes("/health"),
    }),
  );

  app.use("/api/v1", apiRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};
