import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import { adminService } from "./admin.service.js";
import type { AdminListItemsQuery, ItemIdParam } from "./admin.validator.js";

export const adminController = {
  analytics: asyncHandler(async (_req: Request, res: Response) => {
    const snapshot = await adminService.analytics();
    return ok(res, { analytics: snapshot });
  }),

  listItems: asyncHandler(async (req: Request, res: Response) => {
    const q = req.query as unknown as AdminListItemsQuery;
    const page = await adminService.listItems({
      page: q.page,
      pageSize: q.pageSize,
      status: q.status,
      category: q.category,
      hostelName: q.hostelName,
      q: q.q,
    });
    return ok(res, page);
  }),

  removeItem: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as ItemIdParam;
    const item = await adminService.removeItem(id);
    return ok(res, { item });
  }),

  restoreItem: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as ItemIdParam;
    const item = await adminService.restoreItem(id);
    return ok(res, { item });
  }),
};
