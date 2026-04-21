import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

/**
 * Centralized error normalization. Controllers never shape error responses.
 */
export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid input", details: err.flatten() },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    res.status(422).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: err.message },
    });
    return;
  }

  // Duplicate key (Mongo code 11000)
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: number }).code === 11000
  ) {
    res.status(409).json({
      success: false,
      error: { code: "CONFLICT", message: "Resource already exists" },
    });
    return;
  }

  logger.error("Unhandled error", { err: err instanceof Error ? err.message : String(err) });
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: env.NODE_ENV === "production" ? "Something went wrong" : String(err),
    },
  });
};

export const notFoundMiddleware = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "Route not found" },
  });
};
