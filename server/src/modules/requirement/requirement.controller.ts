import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { created, ok } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { requirementService } from "./requirement.service.js";
import type { CreateRequirementBody, ListRequirementsQuery } from "./requirement.validator.js";

const requireUser = (req: Request): string => {
  if (!req.user) throw AppError.unauthorized();
  return req.user.sub;
};

export const requirementController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const ownerId = requireUser(req);
    const requirement = await requirementService.create(ownerId, req.body as CreateRequirementBody);
    return created(res, { requirement });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const ownerId = requireUser(req);
    const id = req.params.id as string;
    await requirementService.delete(id, ownerId);
    res.status(204).end();
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const requirement = await requirementService.get(id);
    return ok(res, { requirement });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const viewerId = req.user?.sub ?? null;
    const page = await requirementService.list(
      viewerId,
      req.query as unknown as ListRequirementsQuery,
    );
    return ok(res, page);
  }),
};
