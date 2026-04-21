"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "./form-field";
import { signInSchema, type SignInValues } from "../schemas/auth.schema";
import { useAuth } from "../hooks/use-auth";

export const SignInForm = () => {
  const { signIn, submitting } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      rollNo: "",
      department: "",
      hostelName: "",
      password: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(signIn)} className="space-y-4" noValidate>
      <FormField
        id="email"
        type="email"
        label="Email"
        placeholder="you@campus.edu"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          id="department"
          label="Department"
          placeholder="Computer Science"
          {...register("department")}
          error={errors.department?.message}
        />
        <FormField
          id="hostelName"
          label="Hostel"
          placeholder="Ganga Hostel"
          {...register("hostelName")}
          error={errors.hostelName?.message}
        />
      </div>

      <FormField
        id="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        autoComplete="current-password"
        {...register("password")}
        error={errors.password?.message}
      />

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
};
