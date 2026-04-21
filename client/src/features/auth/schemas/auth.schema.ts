import { ROLL_NO_REGEX, VALIDATION } from "@hostely/shared";
import { z } from "zod";

const emailField = z.string().trim().toLowerCase().email("Enter a valid email");
const rollNoField = z
  .string()
  .trim()
  .toUpperCase()
  .min(VALIDATION.ROLL_MIN, "Too short")
  .max(VALIDATION.ROLL_MAX, "Too long")
  .regex(ROLL_NO_REGEX, "Letters, numbers, dashes only");
const passwordField = z
  .string()
  .min(VALIDATION.PASSWORD_MIN, `At least ${VALIDATION.PASSWORD_MIN} characters`)
  .max(VALIDATION.PASSWORD_MAX)
  .regex(/[A-Za-z]/, "Must contain a letter")
  .regex(/[0-9]/, "Must contain a number");

export const signUpSchema = z.object({
  name: z.string().trim().min(VALIDATION.NAME_MIN, "Enter your name").max(VALIDATION.NAME_MAX),
  email: emailField,
  rollNo: rollNoField,
  department: z
    .string()
    .trim()
    .min(VALIDATION.DEPARTMENT_MIN, "Enter your department")
    .max(VALIDATION.DEPARTMENT_MAX),
  hostelName: z
    .string()
    .trim()
    .min(VALIDATION.HOSTEL_MIN, "Enter your hostel")
    .max(VALIDATION.HOSTEL_MAX),
  password: passwordField,
});
export type SignUpValues = z.infer<typeof signUpSchema>;

/**
 * Per product spec, sign-in collects email + roll no + department + hostel
 * alongside the password.
 */
export const signInSchema = z.object({
  email: emailField,
  rollNo: rollNoField,
  department: z
    .string()
    .trim()
    .min(VALIDATION.DEPARTMENT_MIN, "Enter your department")
    .max(VALIDATION.DEPARTMENT_MAX),
  hostelName: z
    .string()
    .trim()
    .min(VALIDATION.HOSTEL_MIN, "Enter your hostel")
    .max(VALIDATION.HOSTEL_MAX),
  password: z.string().min(1, "Password is required"),
});
export type SignInValues = z.infer<typeof signInSchema>;
