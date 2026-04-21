import type { PublicUser } from "@hostely/shared";

// Re-export for intra-server use.
export type { PublicUser };

/** Server-only — carries the hashed password. */
export interface CreateUserInput {
  name: string;
  email: string;
  rollNo: string;
  department: string;
  hostelName: string;
  passwordHash: string;
}
