import { z } from "zod";

/** Shared field rules keep client/server validation in lock-step. */
const emailField = z.string().trim().toLowerCase().email("Invalid email");
const rollNoField = z
  .string()
  .trim()
  .toUpperCase()
  .min(3, "Roll number too short")
  .max(20, "Roll number too long")
  .regex(/^[A-Z0-9-]+$/, "Use letters, numbers, and dashes only");
const passwordField = z
  .string()
  .min(8, "At least 8 characters")
  .max(128)
  .regex(/[A-Za-z]/, "Must contain a letter")
  .regex(/[0-9]/, "Must contain a number");

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailField,
  rollNo: rollNoField,
  department: z.string().trim().min(2).max(80),
  hostelName: z.string().trim().min(2).max(80),
  password: passwordField,
});
export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Sign-in accepts email OR rollNo as identifier, plus the contextual
 * profile fields (department + hostelName) — per product requirement.
 */
export const loginSchema = z
  .object({
    email: emailField.optional(),
    rollNo: rollNoField.optional(),
    department: z.string().trim().min(2).max(80),
    hostelName: z.string().trim().min(2).max(80),
    password: z.string().min(1, "Password is required"),
  })
  .refine((v) => Boolean(v.email) || Boolean(v.rollNo), {
    message: "Provide email or roll number",
    path: ["email"],
  });
export type LoginInput = z.infer<typeof loginSchema>;
