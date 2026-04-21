/** Source of truth for roles — referenced by both client guards and server policies. */
export const ROLES = {
  STUDENT: "student",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_VALUES: readonly Role[] = Object.values(ROLES);
