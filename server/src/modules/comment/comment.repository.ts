import type { Comment, CommentParentType } from "@hostely/shared";
import { Types } from "mongoose";
import { UserModel } from "../user/user.model.js";
import { CommentModel, type CommentDoc } from "./comment.model.js";

export interface ICommentRepository {
  create(input: {
    parentType: CommentParentType;
    parentId: string;
    authorId: string;
    body: string;
  }): Promise<Comment>;
  listForParent(parentType: CommentParentType, parentId: string): Promise<Comment[]>;
  findOwnerById(id: string): Promise<{ authorId: string } | null>;
  delete(id: string): Promise<boolean>;
}

type PopulatedUser = {
  _id: Types.ObjectId;
  name: string;
  hostelName: string;
  department: string;
  avatarUrl?: string;
};

const toPublic = (doc: CommentDoc, author: PopulatedUser | null): Comment => ({
  id: doc._id.toString(),
  parentType: doc.parentType as CommentParentType,
  parentId: doc.parentId.toString(),
  body: doc.body,
  author: author
    ? {
        id: author._id.toString(),
        name: author.name,
        hostelName: author.hostelName,
        department: author.department,
        avatarUrl: author.avatarUrl,
      }
    : { id: doc.author.toString(), name: "Unknown", hostelName: "", department: "" },
  createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
  updatedAt: doc.updatedAt?.toISOString?.() ?? new Date().toISOString(),
});

export class CommentRepository implements ICommentRepository {
  async create(input: {
    parentType: CommentParentType;
    parentId: string;
    authorId: string;
    body: string;
  }): Promise<Comment> {
    const doc = (await CommentModel.create({
      parentType: input.parentType,
      parentId: new Types.ObjectId(input.parentId),
      author: new Types.ObjectId(input.authorId),
      body: input.body,
    })) as unknown as CommentDoc;
    const author = await UserModel.findById(input.authorId)
      .select("name hostelName department avatarUrl")
      .lean<PopulatedUser>()
      .exec();
    return toPublic(doc, author);
  }

  async listForParent(parentType: CommentParentType, parentId: string): Promise<Comment[]> {
    if (!Types.ObjectId.isValid(parentId)) return [];
    const docs = (await CommentModel.find({
      parentType,
      parentId: new Types.ObjectId(parentId),
    })
      .sort({ createdAt: 1 })
      .exec()) as unknown as CommentDoc[];

    const authorIds = Array.from(new Set(docs.map((d) => d.author.toString())));
    const authors = authorIds.length
      ? await UserModel.find({ _id: { $in: authorIds } })
          .select("name hostelName department avatarUrl")
          .lean<PopulatedUser[]>()
          .exec()
      : [];
    const authorMap = new Map(authors.map((a) => [a._id.toString(), a]));
    return docs.map((d) => toPublic(d, authorMap.get(d.author.toString()) ?? null));
  }

  async findOwnerById(id: string): Promise<{ authorId: string } | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await CommentModel.findById(id)
      .select("author")
      .lean<{ author: Types.ObjectId }>()
      .exec();
    return doc ? { authorId: doc.author.toString() } : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await CommentModel.deleteOne({ _id: id }).exec();
    return res.deletedCount === 1;
  }
}

export const commentRepository = new CommentRepository();
