import type { Comment, CommentParentType, Item, Requirement } from "@hostely/shared";
import { getHostelSegmentForUserHostel } from "@hostely/shared";
import { AppError } from "../../utils/AppError.js";
import { userRepository, type IUserRepository } from "../user/user.repository.js";
import { itemRepository, type IItemRepository } from "../item/item.repository.js";
import { notificationService } from "../notification/notification.service.js";
import { commentRepository, type ICommentRepository } from "./comment.repository.js";
import {
  requirementRepository,
  type IRequirementRepository,
} from "../requirement/requirement.repository.js";

/**
 * Comments belong to one of two parent surfaces. The service validates
 * that the parent exists before accepting the comment, and enforces
 * author-only deletion.
 */
export class CommentService {
  constructor(
    private readonly comments: ICommentRepository,
    private readonly items: IItemRepository,
    private readonly requirements: IRequirementRepository,
    private readonly users: IUserRepository,
  ) {}

  private async assertSegmentAccess(viewerId: string, parent: Item | Requirement): Promise<void> {
    const viewer = await this.users.findById(viewerId);
    if (!viewer) return;
    const vSeg = getHostelSegmentForUserHostel(viewer.hostelName);
    const pSeg = getHostelSegmentForUserHostel(parent.hostelName);
    const isOwner = parent.author.id === viewerId;
    if (!isOwner && vSeg && pSeg && vSeg !== pSeg) {
      throw AppError.notFound("Not found");
    }
  }

  private async loadParent(parentType: CommentParentType, parentId: string) {
    return parentType === "item"
      ? this.items.findById(parentId)
      : this.requirements.findById(parentId);
  }

  async add(
    parentType: CommentParentType,
    parentId: string,
    authorId: string,
    body: string,
  ): Promise<Comment> {
    const parent = await this.loadParent(parentType, parentId);
    if (!parent)
      throw AppError.notFound(`${parentType === "item" ? "Listing" : "Requirement"} not found`);
    await this.assertSegmentAccess(authorId, parent);

    const comment = await this.comments.create({ parentType, parentId, authorId, body });

    // Notify the thread owner if someone else commented on their post.
    if (parent.author.id !== authorId) {
      const snippet = body.length > 120 ? `${body.slice(0, 117)}…` : body;
      const link =
        parentType === "item" ? `/dashboard/items/${parent.id}` : `/dashboard/requirements`;
      await notificationService.dispatch({
        recipientId: parent.author.id,
        type: "comment",
        title: `New comment on "${parent.title}"`,
        body: `${comment.author.name}: ${snippet}`,
        link,
      });
    }

    return comment;
  }

  async list(
    parentType: CommentParentType,
    parentId: string,
    viewerId: string,
  ): Promise<Comment[]> {
    const parent = await this.loadParent(parentType, parentId);
    if (!parent)
      throw AppError.notFound(`${parentType === "item" ? "Listing" : "Requirement"} not found`);
    await this.assertSegmentAccess(viewerId, parent);
    return this.comments.listForParent(parentType, parentId);
  }

  async delete(commentId: string, requesterId: string): Promise<void> {
    const owner = await this.comments.findOwnerById(commentId);
    if (!owner) throw AppError.notFound("Comment not found");
    if (owner.authorId !== requesterId) throw AppError.forbidden("Not your comment");
    await this.comments.delete(commentId);
  }
}

export const commentService = new CommentService(
  commentRepository,
  itemRepository,
  requirementRepository,
  userRepository,
);
