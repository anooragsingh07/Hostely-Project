import { Schema, type Types, model, type HydratedDocument, type InferSchemaType } from "mongoose";

/**
 * Category — marketplace taxonomy. Seeded from `ITEM_CATEGORIES` at boot;
 * admins may add more at runtime. Items and Requirements reference the
 * slug by value (no foreign key) so rename / delete doesn't cascade.
 *
 * `seeded: true` protects the baseline slugs from being hard-deleted — the
 * admin service flips `active` instead.
 */
const categorySchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      minlength: 2,
      maxlength: 40,
      match: [/^[a-z0-9-]+$/, "Slug must be lowercase letters, digits, or dashes"],
    },
    label: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    active: { type: Boolean, default: true, index: true },
    seeded: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, versionKey: false },
);

export type CategoryDoc = HydratedDocument<InferSchemaType<typeof categorySchema>> & {
  _id: Types.ObjectId;
};
export const CategoryModel = model("Category", categorySchema);
