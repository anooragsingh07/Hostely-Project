"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "./form-field";
import { signUpSchema, type SignUpValues } from "../schemas/auth.schema";
import { useAuth } from "../hooks/use-auth";

export const SignUpForm = () => {
  const { signUp, submitting } = useAuth();
  const {
    register,
    handleSubmit,
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
        hint="8+ chars"
        placeholder="••••••••"
        autoComplete="new-password"
        {...register("password")}
        error={errors.password?.message}
      />

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
