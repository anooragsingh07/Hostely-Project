import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

/**
 * Generic Zod validator. Controllers consume `req.body` / `req.params` / `req.query`
 * as parsed data — they never re-validate shape.
 */
type Source = "body" | "params" | "query";

export const validate =
  <T>(schema: ZodSchema<T>, source: Source = "body") =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.parse(req[source]);
    // Overwrite so downstream sees the parsed (coerced, trimmed) values.
    (req as unknown as Record<Source, unknown>)[source] = parsed;
    next();
  };
