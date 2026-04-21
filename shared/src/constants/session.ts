/**
 * Session cookie name — shared so the server setter and the Next.js
 * middleware guard agree on the exact key.
 */
export const SESSION_COOKIE_NAME = "hostely_session";

/** Error codes returned in failed auth responses. */
export const AUTH_ERROR_CODES = {
  DOMAIN_NOT_ALLOWED: "DOMAIN_NOT_ALLOWED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  PROFILE_MISMATCH: "PROFILE_MISMATCH",
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];
