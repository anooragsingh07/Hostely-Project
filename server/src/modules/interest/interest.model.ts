import { MARKETPLACE_LIMITS } from "@hostely/shared";
import { Schema, type Types, model, type HydratedDocument, type InferSchemaType } from "mongoose";

/**
 * Interest — a user signals they want to buy a specific item.
 * Uniqueness on (item, user) prevents duplicate signals.
 */
const interestSchema = new Schema(
  {
    item: { type: Schema.Types.ObjectId, ref: "Item", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    note: { type: String, trim: true, maxlength: MARKETPLACE_LIMITS.INTEREST_NOTE_MAX },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

interestSchema.index({ item: 1, user: 1 }, { unique: true });

export type InterestDoc = HydratedDocument<InferSchemaType<typeof interestSchema>> & {
  _id: Types.ObjectId;
};
export const InterestModel = model("Interest", interestSchema);
