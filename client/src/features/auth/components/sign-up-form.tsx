"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { HOSTELS } from "@hostely/shared";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import { FormField } from "./form-field";
import { signUpSchema, type SignUpValues } from "../schemas/auth.schema";
import { useAuth } from "../hooks/use-auth";

const HOSTEL_OPTIONS = HOSTELS.map((h) => ({
  value: h.name,
  label: h.name,
  group: h.segment === "boys" ? "Boys hostels" : "Girls hostels",
}));

export const SignUpForm = () => {
  const { signUp, submitting } = useAuth();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      rollNo: "",
      department: "",
      hostelName: "",
      password: "",
      acceptPolicies: false,
    },
  });

  return (
    <form onSubmit={handleSubmit(signUp)} className="space-y-4" noValidate>
      <FormField
        id="name"
        label="Full name"
        placeholder="Anoorag Singh"
        autoComplete="name"
        {...register("name")}
        error={errors.name?.message}
      />

      <FormField
        id="email"
        type="email"
        label="Email"
        placeholder="you@cgc.edu.in"
        autoComplete="email"
        {...register("email")}
        error={errors.email?.message}
      />

      <FormField
        id="rollNo"
        label="Roll number"
        placeholder="e.g. 21BCE1234"
        autoComplete="username"
        {...register("rollNo")}
        error={errors.rollNo?.message}
      />

      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
        <FormField
          id="department"
          label="Department"
          placeholder="Computer Science"
          {...register("department")}
          error={errors.department?.message}
        />
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="hostelName">Hostel</Label>
          </div>
          <Controller
            control={control}
            name="hostelName"
            render={({ field }) => (
              <Select
                id="hostelName"
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Select your hostel"
                options={HOSTEL_OPTIONS}
                aria-invalid={Boolean(errors.hostelName)}
              />
            )}
          />
          <FieldError message={errors.hostelName?.message} />
        </div>
      </div>

      <FormField
        id="password"
        type="password"
        label="Password"
        hint="8+ chars"
        placeholder="••••••••"
        autoComplete="new-password"
        {...register("password")}
        error={errors.password?.message}
      />

      <div className="space-y-2">
        <Controller
          control={control}
          name="acceptPolicies"
          render={({ field }) => (
            <label
              className={cn(
                "border-border bg-muted/30 text-muted-foreground flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm leading-snug",
                errors.acceptPolicies && "border-destructive/50",
              )}
            >
              <input
                type="checkbox"
                className="border-input text-primary focus-visible:ring-ring mt-0.5 h-4 w-4 rounded"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                onBlur={field.onBlur}
                aria-invalid={Boolean(errors.acceptPolicies)}
              />
              <span>
                I agree to the{" "}
                <Link
                  href="/terms-and-conditions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground font-medium underline underline-offset-4 hover:no-underline"
                >
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground font-medium underline underline-offset-4 hover:no-underline"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          )}
        />
        <FieldError message={errors.acceptPolicies?.message} />
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
};
