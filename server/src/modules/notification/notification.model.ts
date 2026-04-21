import { NOTIFICATION_TYPES } from "@hostely/shared";
import { Schema, type Types, model, type HydratedDocument, type InferSchemaType } from "mongoose";

/**
 * Durable notification. Writes happen inside business services
 * (interest / comment / chat) and are fan-out over Socket.io for realtime.
 */
const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, trim: true, maxlength: 500 },
    link: { type: String, trim: true, maxlength: 500 },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

export type NotificationDoc = HydratedDocument<InferSchemaType<typeof notificationSchema>> & {
  _id: Types.ObjectId;
};
export const NotificationModel = model("Notification", notificationSchema);
