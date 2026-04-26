import type { Item, Paginated, Role } from "@hostely/shared";
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
import { itemRepository, type IItemRepository } from "./item.repository.js";
import type { CreateItemBody, ListItemsQuery, UpdateItemBody } from "./item.validator.js";

/**
 * Item business rules:
 *   - Seller's hostel defaults to their profile hostel unless overridden.
 *   - Only the owner can update / delete.
 *   - "active" is the default search scope; owners can see all their own.
 */
export class ItemService {
  constructor(
    private readonly items: IItemRepository,
    private readonly users: IUserRepository,
    private readonly categories: CategoryService,
  ) {}

  async create(ownerId: string, body: CreateItemBody): Promise<Item> {
    const owner = await this.users.findById(ownerId);
    if (!owner) throw AppError.unauthorized("Unknown user");
    await this.categories.assertActive(body.category);
    // Normalize the hostel through the catalog so aliases ("h-1", "H1")
    // collapse to the canonical display name. Falls back to the owner's
    // profile hostel, which is already canonical at signup time.
    const rawHostel = body.hostelName ?? owner.hostelName;
    const resolved = getHostel(rawHostel)?.name ?? rawHostel;
    const ownerSeg = getHostelSegmentForUserHostel(owner.hostelName);
    const listingSeg = getHostelSegmentForUserHostel(resolved);
    if (ownerSeg && listingSeg && ownerSeg !== listingSeg) {
      throw AppError.badRequest("Listing hostel must be in your hostel segment");
    }
    return this.items.create({
      ownerId,
      title: body.title,
      description: body.description,
      price: body.price,
      category: body.category,
      condition: body.condition,
      hostelName: resolved,
      images: body.images,
    });
  }

  async update(id: string, ownerId: string, body: UpdateItemBody): Promise<Item> {
    if (body.category) await this.categories.assertActive(body.category);
    const updated = await this.items.update(id, ownerId, body);
    if (!updated) throw AppError.notFound("Listing not found");
    return updated;
  }

  async delete(id: string, ownerId: string): Promise<void> {
    const ok = await this.items.delete(id, ownerId);
    if (!ok) throw AppError.notFound("Listing not found");
  }

  async get(id: string, viewerId: string, viewerRole: Role): Promise<Item> {
    const item = await this.items.findById(id);
    if (!item) throw AppError.notFound("Listing not found");
    if (viewerRole !== ROLES.ADMIN) {
      const viewer = await this.users.findById(viewerId);
      if (viewer) {
        const vSeg = getHostelSegmentForUserHostel(viewer.hostelName);
        const iSeg = getHostelSegmentForUserHostel(item.hostelName);
        const isOwner = item.author.id === viewerId;
        if (!isOwner && vSeg && iSeg && vSeg !== iSeg) {
          throw AppError.notFound("Listing not found");
        }
      }
    }
    return item;
  }

  async list(viewerId: string | null, q: ListItemsQuery): Promise<Paginated<Item>> {
    let nearHostel = q.nearHostel;
    let audienceHostelNames: string[] | undefined;

    if (viewerId) {
      const viewer = await this.users.findById(viewerId);
      if (viewer) {
        const seg = getHostelSegmentForUserHostel(viewer.hostelName);
        if (seg) audienceHostelNames = [...hostelNamesInSegment(seg)];
        if (!nearHostel && q.sortByHostel) nearHostel = viewer.hostelName;
      }
    }

    return this.items.list({
      q: q.q,
      category: q.category,
      hostelName: q.hostelName,
      nearHostel,
      status: q.status,
      ownerId: q.mine && viewerId ? viewerId : undefined,
      audienceHostelNames,
      page: q.page,
      pageSize: Math.min(q.pageSize, MARKETPLACE_LIMITS.PAGE_SIZE_MAX),
    });
  }
}

export const itemService = new ItemService(itemRepository, userRepository, categoryService);
