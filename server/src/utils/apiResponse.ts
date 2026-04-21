import type { Response } from "express";

/** Canonical success envelope — clients rely on `{ success, data }`. */
export const ok = <T>(res: Response, data: T, statusCode = 200): Response =>
  res.status(statusCode).json({ success: true, data });

export const created = <T>(res: Response, data: T): Response => ok(res, data, 201);
