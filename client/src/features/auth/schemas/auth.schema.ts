import { z } from "zod";

const emailField = z.string().trim().toLowerCase().email("Enter a valid email");
const rollNoField = z
  .string()
  .trim()
  .toUpperCase()
  .min(3, "Too short")
  .max(20, "Too long")
  .regex(/^[A-Z0-9-]+$/, "Letters, numbers, dashes only");
const passwordField = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Za-z]/, "Must contain a letter")
  .regex(/[0-9]/, "Must contain a number");

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: emailField,
  rollNo: rollNoField,
  department: z.string().trim().min(2, "Enter your department").max(80),
  hostelName: z.string().trim().min(2, "Enter your hostel").max(80),
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
  department: z.string().trim().min(2, "Enter your department").max(80),
  hostelName: z.string().trim().min(2, "Enter your hostel").max(80),
  password: z.string().min(1, "Password is required"),
});
export type SignInValues = z.infer<typeof signInSchema>;
