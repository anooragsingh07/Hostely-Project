import { MARKETPLACE_LIMITS } from "@hostely/shared";
import { z } from "zod";

export const markInterestSchema = z.object({
  note: z.string().trim().max(MARKETPLACE_LIMITS.INTEREST_NOTE_MAX).optional(),
});
export type MarkInterestBody = z.infer<typeof markInterestSchema>;
