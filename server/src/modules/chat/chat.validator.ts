import { z } from "zod";

const objectIdRegex = /^[a-f0-9]{24}$/i;

export const sendMessageSchema = z.object({
  toUserId: z.string().regex(objectIdRegex, "Invalid recipient"),
  body: z.string().trim().min(1, "Message can't be empty").max(4000, "Message too long"),
});
export type SendMessageBody = z.infer<typeof sendMessageSchema>;

export const peerParamSchema = z.object({
  peerId: z.string().regex(objectIdRegex, "Invalid id"),
});
export type PeerParam = z.infer<typeof peerParamSchema>;
