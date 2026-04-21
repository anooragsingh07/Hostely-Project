import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { created, ok } from "../../utils/apiResponse.js";
import { categoryService } from "./category.service.js";
import type { CreateCategoryBody, SlugParam } from "./category.validator.js";

export const categoryController = {
  /** Public — used by the client to populate filter + form dropdowns. */
  listPublic: asyncHandler(async (_req: Request, res: Response) => {
    const categories = await categoryService.listActive();
    return ok(res, { categories });
  }),

  /** Admin — also surfaces retired (`active: false`) categories. */
  listAll: asyncHandler(async (_req: Request, res: Response) => {
    const categories = await categoryService.listAll();
    return ok(res, { categories });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as CreateCategoryBody;
    const category = await categoryService.create({
      slug: body.slug,
      label: body.label,
      createdBy: req.user?.sub,
    });
    return created(res, { category });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params as SlugParam;
    const category = await categoryService.remove(slug);
    return ok(res, { category });
  }),

  restore: asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params as SlugParam;
    const category = await categoryService.restore(slug);
    return ok(res, { category });
  }),
};
