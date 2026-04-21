/** Validation limits shared by client (react-hook-form) and server (zod). */
export const VALIDATION = {
  NAME_MIN: 2,
  NAME_MAX: 80,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  ROLL_MIN: 3,
  ROLL_MAX: 20,
  DEPARTMENT_MIN: 2,
  DEPARTMENT_MAX: 80,
  HOSTEL_MIN: 2,
  HOSTEL_MAX: 80,
} as const;

/** Uppercase letters, digits, and dashes only. */
export const ROLL_NO_REGEX = /^[A-Z0-9-]+$/;
