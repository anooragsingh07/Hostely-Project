import { SESSION_COOKIE_NAME } from "@hostely/shared";
import type { CookieOptions, Response } from "express";
import { env } from "../config/env.js";

/**
 * Session cookie: HTTP-only, SameSite=Lax, `Secure` in production.
 * JS can't read it — reduces XSS token exfiltration risk.
 */
const cookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
});

export const setSessionCookie = (res: Response, token: string): void => {
  res.cookie(SESSION_COOKIE_NAME, token, {
    ...cookieOptions(),
    maxAge: env.SESSION_MAX_AGE_SECONDS * 1000,
  });
};

export const clearSessionCookie = (res: Response): void => {
  res.clearCookie(SESSION_COOKIE_NAME, cookieOptions());
};
