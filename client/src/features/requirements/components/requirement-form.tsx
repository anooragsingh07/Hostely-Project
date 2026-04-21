"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { HOSTELS } from "@hostely/shared";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { cn } from "@/lib/cn";

const HOSTEL_OPTIONS = HOSTELS.map((h) => ({
  value: h.name,
  label: h.name,
  group: `${h.zone[0]?.toUpperCase()}${h.zone.slice(1)} zone`,
}));
import {
  requirementFormSchema,
  type RequirementFormValues,
} from "@/features/items/schemas/item.schema";
import { requirementsApi } from "../services/requirements.api";

interface ApiError {
  message?: string;
}

interface RequirementFormProps {
  onCreated?: () => void;
}

const selectClasses = cn(
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-subtle",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "transition-colors duration-200",
);

export const RequirementForm = ({ onCreated }: RequirementFormProps) => {
  const { categories } = useCategories();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RequirementFormValues>({
    resolver: zodResolver(requirementFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "other",
      budgetMax: undefined,
      hostelName: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await requirementsApi.create({
        title: values.title,
        description: values.description,
        category: values.category,
        budgetMax: values.budgetMax,
        hostelName: values.hostelName?.trim() || undefined,
      });
      toast.success("Requirement posted");
      reset();
      onCreated?.();
    } catch (e) {
      toast.error((e as ApiError).message ?? "Could not post requirement");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="req-title">What are you looking for?</Label>
        <Input
          id="req-title"
          placeholder="Looking for a DSA textbook"
          aria-invalid={Boolean(errors.title)}
          {...register("title")}
        />
        <FieldError message={errors.title?.message} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="req-category">Category</Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <select
                id="req-category"
                className={selectClasses}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            )}
          />
          <FieldError message={errors.category?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="req-budget">Max budget (₹, optional)</Label>
          <Input
            id="req-budget"
            type="number"
            min={0}
            placeholder="500"
            {...register("budgetMax")}
          />
          <FieldError message={errors.budgetMax?.message} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="req-hostel">Hostel (optional)</Label>
        <Controller
          control={control}
          name="hostelName"
          render={({ field }) => (
            <Select
              id="req-hostel"
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="Use profile hostel"
              options={HOSTEL_OPTIONS}
              aria-invalid={Boolean(errors.hostelName)}
            />
          )}
        />
        <FieldError message={errors.hostelName?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="req-description">Details</Label>
        <Textarea
          id="req-description"
          rows={4}
          placeholder="Edition, condition, timing…"
          aria-invalid={Boolean(errors.description)}
          {...register("description")}
        />
        <FieldError message={errors.description?.message} />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Posting…" : "Post requirement"}
        </Button>
      </div>
    </form>
  );
};
