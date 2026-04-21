import { SESSION_COOKIE_NAME } from "@hostely/shared";
import type { NextFunction, Request, Response } from "express";
import { verifyJwt, type JwtPayload } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Extracts the JWT from the HTTP-only session cookie.
 * Falls back to `Authorization: Bearer <token>` for non-browser clients
 * (curl, native mobile, CLI) — same verification path.
 */
const extractToken = (req: Request): string | null => {
  const cookieToken = req.cookies?.[SESSION_COOKIE_NAME];
  if (typeof cookieToken === "string" && cookieToken.length > 0) return cookieToken;

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    const value = header.slice("Bearer ".length).trim();
    if (value.length > 0) return value;
  }
  return null;
};

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const token = extractToken(req);
  if (!token) throw AppError.unauthorized("Not authenticated");
  req.user = verifyJwt(token);
  next();
};

export const requireRole =
  (...roles: Array<JwtPayload["role"]>) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw AppError.unauthorized();
    if (!roles.includes(req.user.role)) throw AppError.forbidden("Insufficient role");
    next();
  };
