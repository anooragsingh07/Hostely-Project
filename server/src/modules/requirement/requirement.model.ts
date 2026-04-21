import { ITEM_CATEGORIES, MARKETPLACE_LIMITS, REQUIREMENT_STATUSES } from "@hostely/shared";
import { Schema, type Types, model, type HydratedDocument, type InferSchemaType } from "mongoose";

/**
 * Requirement — a "wanted" post. Inverse of Item:
 * someone is looking for something, others can reach out via comments.
 */
const requirementSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: MARKETPLACE_LIMITS.TITLE_MIN,
      maxlength: MARKETPLACE_LIMITS.TITLE_MAX,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: MARKETPLACE_LIMITS.DESCRIPTION_MIN,
      maxlength: MARKETPLACE_LIMITS.DESCRIPTION_MAX,
    },
    category: { type: String, enum: ITEM_CATEGORIES, required: true, index: true },
    budgetMax: {
      type: Number,
      min: MARKETPLACE_LIMITS.PRICE_MIN,
      max: MARKETPLACE_LIMITS.PRICE_MAX,
    },
    hostelName: { type: String, required: true, trim: true, index: true },
    status: { type: String, enum: REQUIREMENT_STATUSES, default: "open", index: true },
  },
  { timestamps: true, versionKey: false },
);

requirementSchema.index({ title: "text", description: "text" });
requirementSchema.index({ hostelName: 1, category: 1, createdAt: -1 });
requirementSchema.index({ status: 1, hostelName: 1, createdAt: -1 });
requirementSchema.index({ owner: 1, createdAt: -1 });

export type RequirementDoc = HydratedDocument<InferSchemaType<typeof requirementSchema>> & {
  _id: Types.ObjectId;
};
export const RequirementModel = model("Requirement", requirementSchema);
