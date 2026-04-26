import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import { requireUserId } from "../../utils/requireUser.js";
import { adminService } from "./admin.service.js";
import type {
  AdminListChatThreadsQuery,
  AdminListItemsQuery,
  AdminListRequirementsQuery,
  AdminListUsersQuery,
  AdminPatchUserBody,
  AdminPurgeChatThreadBody,
  AdminResetPasswordBody,
  AdminUpdateItemBody,
  AdminUpdateRequirementBody,
  CommentIdParam,
  ItemIdParam,
  MessageIdParam,
  RequirementIdParam,
  UserIdParam,
} from "./admin.validator.js";

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

  updateItem: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as ItemIdParam;
    const item = await adminService.updateItem(id, req.body as AdminUpdateItemBody);
    return ok(res, { item });
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

  listUsers: asyncHandler(async (req: Request, res: Response) => {
    const q = req.query as unknown as AdminListUsersQuery;
    const page = await adminService.listUsers({
      page: q.page,
      pageSize: q.pageSize,
      q: q.q,
    });
    return ok(res, page);
  }),

  patchUser: asyncHandler(async (req: Request, res: Response) => {
    const actorId = requireUserId(req);
    const { id } = req.params as UserIdParam;
    const user = await adminService.patchUser(actorId, id, req.body as AdminPatchUserBody);
    return ok(res, { user });
  }),

  resetUserPassword: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as UserIdParam;
    const { newPassword } = req.body as AdminResetPasswordBody;
    await adminService.resetUserPassword(id, newPassword);
    res.status(204).end();
  }),

  listRequirements: asyncHandler(async (req: Request, res: Response) => {
    const q = req.query as unknown as AdminListRequirementsQuery;
    const page = await adminService.listRequirements({
      page: q.page,
      pageSize: q.pageSize,
      status: q.status,
      category: q.category,
      hostelName: q.hostelName,
      q: q.q,
    });
    return ok(res, page);
  }),

  updateRequirement: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as RequirementIdParam;
    const requirement = await adminService.updateRequirement(
      id,
      req.body as AdminUpdateRequirementBody,
    );
    return ok(res, { requirement });
  }),

  removeRequirement: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as RequirementIdParam;
    const requirement = await adminService.removeRequirement(id);
    return ok(res, { requirement });
  }),

  restoreRequirement: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as RequirementIdParam;
    const requirement = await adminService.restoreRequirement(id);
    return ok(res, { requirement });
  }),

  deleteComment: asyncHandler(async (req: Request, res: Response) => {
    const { commentId } = req.params as CommentIdParam;
    await adminService.deleteComment(commentId);
    res.status(204).end();
  }),

  listChatThreads: asyncHandler(async (req: Request, res: Response) => {
    const q = req.query as unknown as AdminListChatThreadsQuery;
    const page = await adminService.listChatThreads({
      page: q.page,
      pageSize: q.pageSize,
    });
    return ok(res, page);
  }),

  deleteChatMessage: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as MessageIdParam;
    await adminService.deleteChatMessage(id);
    res.status(204).end();
  }),

  purgeChatThread: asyncHandler(async (req: Request, res: Response) => {
    const { userA, userB } = req.body as AdminPurgeChatThreadBody;
    const result = await adminService.purgeChatThread(userA, userB);
    return ok(res, result);
  }),
};
