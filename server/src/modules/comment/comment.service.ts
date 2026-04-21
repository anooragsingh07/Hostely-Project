import type { Comment, CommentParentType } from "@hostely/shared";
import { AppError } from "../../utils/AppError.js";
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
  ) {}

  private async loadParent(parentType: CommentParentType, parentId: string) {
    return parentType === "item"
      ? this.items.findById(parentId)
      : this.requirements.findById(parentId);
  }

  private async assertParentExists(parentType: CommentParentType, parentId: string): Promise<void> {
    const exists = await this.loadParent(parentType, parentId);
    if (!exists)
      throw AppError.notFound(`${parentType === "item" ? "Listing" : "Requirement"} not found`);
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

  async list(parentType: CommentParentType, parentId: string): Promise<Comment[]> {
    await this.assertParentExists(parentType, parentId);
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
);
