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
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
