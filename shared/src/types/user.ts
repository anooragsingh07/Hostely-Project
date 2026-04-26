import type { Role } from "../constants/roles";

/** Public user projection — never includes sensitive fields. */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  department: string;
  hostelName: string;
  role: Role;
  /** When true, sign-in and API access are blocked until lifted by an admin. */
  banned?: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
