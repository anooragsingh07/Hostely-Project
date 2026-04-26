import type { Request } from "express";
import { AppError } from "./AppError.js";

/** Shared by controllers after `requireAuth` — returns the JWT subject or 401. */
export const requireUserId = (req: Request): string => {
  if (!req.user) throw AppError.unauthorized();
  return req.user.sub;
};
