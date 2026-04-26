import type { NextFunction, Request, Response } from "express";
import mongoSanitize from "express-mongo-sanitize";

/**
 * Defense-in-depth for NoSQL injection: strips `$`-prefixed operator keys from `body`, `query`,
 * `params`, and `headers` before they reach handlers. Repositories still use structured filters /
 * bound values (no string-built query documents). This stack uses MongoDB, not SQL — there are no
 * raw concatenated SQL strings to parameterize.
 */
export const mongoInjectionSanitizer = mongoSanitize({
  replaceWith: "_",
  onSanitize: ({ req, key }) => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[sanitize] stripped operator key", { path: req.path, key });
    }
  },
});

const NUL = String.fromCharCode(0);

/** Removes NUL bytes from nested strings — Postgres/Mongo both choke on them. */
const stripNullBytes = (value: unknown): unknown => {
  if (typeof value === "string") return value.split(NUL).join("");
  if (Array.isArray(value)) return value.map(stripNullBytes);
  if (value !== null && typeof value === "object" && !(value instanceof Date)) {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = stripNullBytes(v);
    }
    return out;
  }
  return value;
};

/** Runs after JSON parsing so Zod sees already-normalized payloads. */
export const stripNullBytesMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (req.body !== undefined && req.body !== null && typeof req.body === "object") {
    req.body = stripNullBytes(req.body) as Request["body"];
  }
  next();
};
