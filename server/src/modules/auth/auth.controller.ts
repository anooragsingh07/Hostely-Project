import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { created, ok } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { authService } from "./auth.service.js";
import type { LoginInput, RegisterInput } from "./auth.validator.js";

/**
 * Thin HTTP layer. No business logic here — only request/response plumbing.
 */
export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body as RegisterInput);
    return created(res, result);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body as LoginInput);
    return ok(res, result);
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const user = await authService.me(req.user.sub);
    return ok(res, { user });
  }),
};
