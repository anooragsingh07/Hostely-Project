import { Schema, type Types, model, type HydratedDocument, type InferSchemaType } from "mongoose";

/**
 * Message — a single one-to-one chat record.
 *
 * `threadKey` is the canonical, order-independent identifier for the
 * two-person conversation ("<smallerId>:<largerId>"). Precomputed on
 * insert so we can sort/index without always rebuilding it from sender/recipient.
 */
const messageSchema = new Schema(
  {
    from: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    to: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    threadKey: { type: String, required: true, index: true },
    body: { type: String, required: true, trim: true, minlength: 1, maxlength: 4000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

messageSchema.index({ threadKey: 1, createdAt: -1 });
messageSchema.index({ to: 1, read: 1, createdAt: -1 });

export type MessageDoc = HydratedDocument<InferSchemaType<typeof messageSchema>> & {
  _id: Types.ObjectId;
};
export const MessageModel = model("Message", messageSchema);

/** Canonical, symmetrical key for a DM between two users. */
export const threadKeyOf = (a: string, b: string): string => (a < b ? `${a}:${b}` : `${b}:${a}`);
