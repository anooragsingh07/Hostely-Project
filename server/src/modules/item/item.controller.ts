import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { created, ok } from "../../utils/apiResponse.js";
import { requireUserId } from "../../utils/requireUser.js";
import { AppError } from "../../utils/AppError.js";
import { itemService } from "./item.service.js";
import type { CreateItemBody, IdParam, ListItemsQuery, UpdateItemBody } from "./item.validator.js";

export const itemController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const ownerId = requireUserId(req);
    const item = await itemService.create(ownerId, req.body as CreateItemBody);
    return created(res, { item });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const ownerId = requireUserId(req);
    const { id } = req.params as IdParam;
    const item = await itemService.update(id, ownerId, req.body as UpdateItemBody);
    return ok(res, { item });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const ownerId = requireUserId(req);
    const { id } = req.params as IdParam;
    await itemService.delete(id, ownerId);
    res.status(204).end();
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as IdParam;
    if (!req.user) throw AppError.unauthorized();
    const item = await itemService.get(id, req.user.sub, req.user.role);
    return ok(res, { item });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const viewerId = req.user?.sub ?? null;
    const page = await itemService.list(viewerId, req.query as unknown as ListItemsQuery);
    return ok(res, page);
  }),
};
