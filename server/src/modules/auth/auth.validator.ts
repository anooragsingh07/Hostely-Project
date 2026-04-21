import { ROLL_NO_REGEX, VALIDATION, isCollegeEmail } from "@hostely/shared";
import { z } from "zod";

import { env } from "@/config/env";

/** Shared field rules keep client/server validation in lock-step. */
const emailField = z.string().trim().toLowerCase().email("Invalid email");
const collegeEmailField = emailField.refine(
  (value) => isCollegeEmail(value, env.COLLEGE_EMAIL_DOMAINS_LIST),
  { message: "Email must belong to an approved college domain" },
);
const rollNoField = z
  .string()
  .trim()
  .toUpperCase()
  .min(VALIDATION.ROLL_MIN, "Roll number too short")
  .max(VALIDATION.ROLL_MAX, "Roll number too long")
  .regex(ROLL_NO_REGEX, "Use letters, numbers, and dashes only");
const passwordField = z
  .string()
  .min(VALIDATION.PASSWORD_MIN, `At least ${VALIDATION.PASSWORD_MIN} characters`)
  .max(VALIDATION.PASSWORD_MAX)
  .regex(/[A-Za-z]/, "Must contain a letter")
  .regex(/[0-9]/, "Must contain a number");

export const registerSchema = z.object({
  name: z.string().trim().min(VALIDATION.NAME_MIN).max(VALIDATION.NAME_MAX),
  email: collegeEmailField,
  rollNo: rollNoField,
  department: z.string().trim().min(VALIDATION.DEPARTMENT_MIN).max(VALIDATION.DEPARTMENT_MAX),
  hostelName: z.string().trim().min(VALIDATION.HOSTEL_MIN).max(VALIDATION.HOSTEL_MAX),
  password: passwordField,
});
export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Sign-in accepts email OR rollNo as identifier, plus the contextual
 * profile fields (department + hostelName) — per product requirement.
 */
export const loginSchema = z
  .object({
    email: collegeEmailField.optional(),
    rollNo: rollNoField.optional(),
    department: z.string().trim().min(VALIDATION.DEPARTMENT_MIN).max(VALIDATION.DEPARTMENT_MAX),
    hostelName: z.string().trim().min(VALIDATION.HOSTEL_MIN).max(VALIDATION.HOSTEL_MAX),
    password: z.string().min(1, "Password is required"),
  })
  .refine((v) => Boolean(v.email) || Boolean(v.rollNo), {
    message: "Provide email or roll number",
    path: ["email"],
  });
export type LoginInput = z.infer<typeof loginSchema>;
