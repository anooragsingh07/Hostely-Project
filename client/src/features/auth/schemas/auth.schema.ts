import { ROLL_NO_REGEX, VALIDATION, isCollegeEmail } from "@hostely/shared";
import { z } from "zod";

import { clientEnv } from "@/lib/env";

const baseEmail = z.string().trim().toLowerCase().email("Enter a valid email");

/**
 * When the public env advertises an allow-list, enforce it at the client
 * for instant feedback. Otherwise stay permissive and defer to the server.
 */
const emailField =
  clientEnv.collegeEmailDomains.length > 0
    ? baseEmail.refine((value) => isCollegeEmail(value, clientEnv.collegeEmailDomains), {
        message: "Use your college email",
      })
    : baseEmail;

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
  acceptPolicies: z.boolean().refine((v) => v === true, {
    message: "You must accept the Terms & Conditions and Privacy Policy",
  }),
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
