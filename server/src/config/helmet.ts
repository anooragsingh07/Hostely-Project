import type { Express } from "express";
import helmet from "helmet";
import { env } from "./env.js";

/**
 * Security headers tuned for a JSON API + cookie auth. CSP is disabled —
 * browsers don't execute JSON responses; a tight CSP on API responses
 * only breaks legitimate cross-origin tooling without helping XSS (which
 * is a front-end concern for this stack).
 */
export const applySecurityHeaders = (app: Express): void => {
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      frameguard: { action: "deny" },
      hsts:
        env.NODE_ENV === "production"
          ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
          : false,
      permittedCrossDomainPolicies: false,
    }),
  );
};
