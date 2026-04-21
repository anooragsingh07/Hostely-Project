import { ITEM_CONDITIONS, ITEM_STATUSES, MARKETPLACE_LIMITS } from "@hostely/shared";
import { Schema, type Types, model, type HydratedDocument, type InferSchemaType } from "mongoose";

/**
 * Item — an on-sale listing authored by a user.
 *
 * Indexes:
 *   - text index on (title, description) for search
 *   - (hostelName, category) for filtered list scans
 *   - (owner, createdAt) for "my listings"
 */
const itemSchema = new Schema(
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
    price: {
      type: Number,
      required: true,
      min: MARKETPLACE_LIMITS.PRICE_MIN,
      max: MARKETPLACE_LIMITS.PRICE_MAX,
    },
    // Dynamic taxonomy — validated against the Category collection at the
    // service layer so admins can add slugs without a schema migration.
    category: { type: String, required: true, trim: true, lowercase: true, index: true },
    condition: { type: String, enum: ITEM_CONDITIONS, required: true },
    status: { type: String, enum: ITEM_STATUSES, default: "active", index: true },
    hostelName: { type: String, required: true, trim: true, index: true },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: string[]) => arr.length <= MARKETPLACE_LIMITS.IMAGES_MAX,
        message: `At most ${MARKETPLACE_LIMITS.IMAGES_MAX} images`,
      },
    },
    interestsCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, versionKey: false },
);

itemSchema.index({ title: "text", description: "text" }, { weights: { title: 3, description: 1 } });
// Hot path for the Buy feed filtered by hostel (+ optional category, newest first).
itemSchema.index({ hostelName: 1, category: 1, createdAt: -1 });
// Status-scoped hostel feed — the most common "active listings in my hostel" query.
itemSchema.index({ status: 1, hostelName: 1, createdAt: -1 });
itemSchema.index({ owner: 1, createdAt: -1 });
// Admin / analytics filters: status + category + recency.
itemSchema.index({ status: 1, category: 1, createdAt: -1 });

export type ItemDoc = HydratedDocument<InferSchemaType<typeof itemSchema>> & {
  _id: Types.ObjectId;
};
export const ItemModel = model("Item", itemSchema);
