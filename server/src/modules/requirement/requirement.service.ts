import type { Paginated, Requirement } from "@hostely/shared";
import { MARKETPLACE_LIMITS, getHostel } from "@hostely/shared";
import { AppError } from "../../utils/AppError.js";
import { userRepository, type IUserRepository } from "../user/user.repository.js";
import { requirementRepository, type IRequirementRepository } from "./requirement.repository.js";
import type { CreateRequirementBody, ListRequirementsQuery } from "./requirement.validator.js";

export class RequirementService {
  constructor(
    private readonly reqs: IRequirementRepository,
    private readonly users: IUserRepository,
  ) {}

  async create(ownerId: string, body: CreateRequirementBody): Promise<Requirement> {
    const owner = await this.users.findById(ownerId);
    if (!owner) throw AppError.unauthorized("Unknown user");
    const rawHostel = body.hostelName ?? owner.hostelName;
    const resolved = getHostel(rawHostel)?.name ?? rawHostel;
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

  async get(id: string): Promise<Requirement> {
    const r = await this.reqs.findById(id);
    if (!r) throw AppError.notFound("Requirement not found");
    return r;
  }

  async list(viewerId: string | null, q: ListRequirementsQuery): Promise<Paginated<Requirement>> {
    return this.reqs.list({
      q: q.q,
      category: q.category,
      hostelName: q.hostelName,
      status: q.status,
      ownerId: q.mine && viewerId ? viewerId : undefined,
      page: q.page,
      pageSize: Math.min(q.pageSize, MARKETPLACE_LIMITS.PAGE_SIZE_MAX),
    });
  }
}

export const requirementService = new RequirementService(requirementRepository, userRepository);
