import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { created, ok } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { clearSessionCookie, setSessionCookie } from "../../utils/cookies.js";
import { authService } from "./auth.service.js";
import type { LoginInput, RegisterInput, RegisterRequestBody } from "./auth.validator.js";

/**
 * Thin HTTP layer. No business logic here — only request/response plumbing.
 * Auth success sets the HTTP-only session cookie; the response body carries
 * only the public user profile.
 */
export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { acceptPolicies: _acceptPolicies, ...input } = req.body as RegisterRequestBody;
    const { token, user } = await authService.register(input as RegisterInput);
    setSessionCookie(res, token);
    return created(res, { user });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { token, user } = await authService.login(req.body as LoginInput);
    setSessionCookie(res, token);
    return ok(res, { user });
  }),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    clearSessionCookie(res);
    res.status(204).end();
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const user = await authService.me(req.user.sub);
    return ok(res, { user });
  }),
};
