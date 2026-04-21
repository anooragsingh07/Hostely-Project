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

/** Verifies `Authorization: Bearer <jwt>` and attaches payload to req.user. */
export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw AppError.unauthorized("Missing bearer token");
  const token = header.slice("Bearer ".length).trim();
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
