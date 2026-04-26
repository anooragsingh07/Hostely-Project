import type { Paginated, Requirement, Role } from "@hostely/shared";
import {
  MARKETPLACE_LIMITS,
  ROLES,
  getHostel,
  getHostelSegmentForUserHostel,
  hostelNamesInSegment,
} from "@hostely/shared";
import { AppError } from "../../utils/AppError.js";
import { categoryService, type CategoryService } from "../category/category.service.js";
import { userRepository, type IUserRepository } from "../user/user.repository.js";
import { requirementRepository, type IRequirementRepository } from "./requirement.repository.js";
import type { CreateRequirementBody, ListRequirementsQuery } from "./requirement.validator.js";

export class RequirementService {
  constructor(
    private readonly reqs: IRequirementRepository,
    private readonly users: IUserRepository,
    private readonly categories: CategoryService,
  ) {}

  async create(ownerId: string, body: CreateRequirementBody): Promise<Requirement> {
    const owner = await this.users.findById(ownerId);
    if (!owner) throw AppError.unauthorized("Unknown user");
    await this.categories.assertActive(body.category);
    const rawHostel = body.hostelName ?? owner.hostelName;
    const resolved = getHostel(rawHostel)?.name ?? rawHostel;
    const ownerSeg = getHostelSegmentForUserHostel(owner.hostelName);
    const postSeg = getHostelSegmentForUserHostel(resolved);
    if (ownerSeg && postSeg && ownerSeg !== postSeg) {
      throw AppError.badRequest("Requirement hostel must be in your hostel segment");
    }
    return this.reqs.create({
      ownerId,
      title: body.title,
      description: body.description,
      category: body.category,
      budgetMax: body.budgetMax,
      hostelName: resolved,
    });
  }

  async delete(id: string, ownerId: string): Promise<void> {
    const ok = await this.reqs.delete(id, ownerId);
    if (!ok) throw AppError.notFound("Requirement not found");
  }

  async get(id: string, viewerId: string, viewerRole: Role): Promise<Requirement> {
    const r = await this.reqs.findById(id);
    if (!r) throw AppError.notFound("Requirement not found");
    const isOwner = r.author.id === viewerId;
    if (r.status === "removed" && viewerRole !== ROLES.ADMIN && !isOwner) {
      throw AppError.notFound("Requirement not found");
    }
    if (viewerRole !== ROLES.ADMIN) {
      const viewer = await this.users.findById(viewerId);
      if (viewer) {
        const vSeg = getHostelSegmentForUserHostel(viewer.hostelName);
        const rSeg = getHostelSegmentForUserHostel(r.hostelName);
        if (!isOwner && vSeg && rSeg && vSeg !== rSeg) {
          throw AppError.notFound("Requirement not found");
        }
      }
    }
    return r;
  }

  async list(viewerId: string | null, q: ListRequirementsQuery): Promise<Paginated<Requirement>> {
    let audienceHostelNames: string[] | undefined;
    if (viewerId) {
      const viewer = await this.users.findById(viewerId);
      if (viewer) {
        const seg = getHostelSegmentForUserHostel(viewer.hostelName);
        if (seg) audienceHostelNames = [...hostelNamesInSegment(seg)];
      }
    }

    return this.reqs.list({
      q: q.q,
      category: q.category,
      hostelName: q.hostelName,
      status: q.status,
      ownerId: q.mine && viewerId ? viewerId : undefined,
      audienceHostelNames,
      page: q.page,
      pageSize: Math.min(q.pageSize, MARKETPLACE_LIMITS.PAGE_SIZE_MAX),
    });
  }
}

export const requirementService = new RequirementService(
  requirementRepository,
  userRepository,
  categoryService,
);
