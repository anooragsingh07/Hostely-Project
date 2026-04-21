import { COMMENT_PARENT_TYPES, MARKETPLACE_LIMITS } from "@hostely/shared";
import { Schema, type Types, model, type HydratedDocument, type InferSchemaType } from "mongoose";

/**
 * Polymorphic comment — attaches to either an Item or a Requirement.
 * The (parentType, parentId) composite index powers threaded reads.
 */
const commentSchema = new Schema(
  {
    parentType: { type: String, enum: COMMENT_PARENT_TYPES, required: true },
    parentId: { type: Schema.Types.ObjectId, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    body: {
      type: String,
      required: true,
      trim: true,
      minlength: MARKETPLACE_LIMITS.COMMENT_MIN,
      maxlength: MARKETPLACE_LIMITS.COMMENT_MAX,
    },
  },
  { timestamps: true, versionKey: false },
);

commentSchema.index({ parentType: 1, parentId: 1, createdAt: -1 });

export type CommentDoc = HydratedDocument<InferSchemaType<typeof commentSchema>> & {
  _id: Types.ObjectId;
};
export const CommentModel = model("Comment", commentSchema);
