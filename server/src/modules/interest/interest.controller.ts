import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { created, ok } from "../../utils/apiResponse.js";
import { requireUserId } from "../../utils/requireUser.js";
import { interestService } from "./interest.service.js";
import type { MarkInterestBody } from "./interest.validator.js";

export const interestController = {
  mark: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const itemId = req.params.id as string;
    const interest = await interestService.mark(
      itemId,
      userId,
      (req.body as MarkInterestBody).note,
    );
    return created(res, { interest });
  }),

  unmark: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const itemId = req.params.id as string;
    await interestService.unmark(itemId, userId);
    res.status(204).end();
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const itemId = req.params.id as string;
    const interests = await interestService.listForItem(itemId, userId);
    return ok(res, { interests });
  }),

  mine: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const itemId = req.params.id as string;
    const marked = await interestService.hasMarked(itemId, userId);
    return ok(res, { marked });
  }),
};
