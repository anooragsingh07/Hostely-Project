import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

/**
 * Generic Zod validator. Controllers consume `req.body` / `req.params` / `req.query`
 * as parsed data — they never re-validate shape.
 *
 * Uses ZodTypeAny so schemas with `.default(...)` / `.transform(...)` (whose
 * input and output types differ) are accepted without manual type gymnastics.
 */
type Source = "body" | "params" | "query";

export const validate =
  (schema: ZodTypeAny, source: Source = "body") =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.parse(req[source]);
    // Overwrite so downstream sees the parsed (coerced, trimmed) values.
    (req as unknown as Record<Source, unknown>)[source] = parsed;
    next();
  };
