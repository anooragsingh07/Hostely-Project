import type { Interest } from "@hostely/shared";
import { getHostelSegmentForUserHostel } from "@hostely/shared";
import { AppError } from "../../utils/AppError.js";
import { userRepository, type IUserRepository } from "../user/user.repository.js";
import { itemRepository, type IItemRepository } from "../item/item.repository.js";
import { notificationService } from "../notification/notification.service.js";
import { interestRepository, type IInterestRepository } from "./interest.repository.js";

/**
 * Interests are public signals attached to an item.
 *   - Sellers can't mark interest on their own listings.
 *   - Marking is idempotent: returns the existing row when already marked.
 *   - The item's denormalized `interestsCount` is kept in sync here.
 */
export class InterestService {
  constructor(
    private readonly interests: IInterestRepository,
    private readonly items: IItemRepository,
    private readonly users: IUserRepository,
  ) {}

  async mark(itemId: string, userId: string, note?: string): Promise<Interest> {
    const item = await this.items.findById(itemId);
    if (!item) throw AppError.notFound("Listing not found");
    if (item.author.id === userId) {
      throw AppError.badRequest("You cannot mark interest on your own listing");
    }
    const viewer = await this.users.findById(userId);
    if (viewer) {
      const vSeg = getHostelSegmentForUserHostel(viewer.hostelName);
      const iSeg = getHostelSegmentForUserHostel(item.hostelName);
      if (vSeg && iSeg && vSeg !== iSeg) {
        throw AppError.notFound("Listing not found");
      }
    }

    const { interest, created } = await this.interests.add(itemId, userId, note);
    if (created) {
      await this.items.incrementInterestsCount(itemId, 1);
      // Durable notification + realtime fan-out to the seller.
      await notificationService.dispatch({
        recipientId: item.author.id,
        type: "interest",
        title: "Someone's interested",
        body: `${interest.user.name} marked interest on "${item.title}"`,
        link: `/dashboard/items/${item.id}`,
      });
    }
    return interest;
  }

  async unmark(itemId: string, userId: string): Promise<void> {
    const removed = await this.interests.remove(itemId, userId);
    if (removed) {
      await this.items.incrementInterestsCount(itemId, -1);
    }
  }

  async listForItem(itemId: string, viewerId: string): Promise<Interest[]> {
    const item = await this.items.findById(itemId);
    if (!item) throw AppError.notFound("Listing not found");
    // Only the seller should see who's interested — avoids phonebook scraping.
    if (item.author.id !== viewerId) throw AppError.forbidden();
    return this.interests.listByItem(itemId);
  }

  async hasMarked(itemId: string, userId: string): Promise<boolean> {
    return this.interests.existsByUser(itemId, userId);
  }
}

export const interestService = new InterestService(
  interestRepository,
  itemRepository,
  userRepository,
);
