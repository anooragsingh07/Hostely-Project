"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ITEM_CONDITIONS, hostelsInViewerSegment } from "@hostely/shared";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import { useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMe } from "@/features/auth/hooks/use-me";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { cn } from "@/lib/cn";
import { getApiErrorMessage } from "@/lib/error-message";
import { itemsApi } from "../services/items.api";
import { listingSchema, type ListingValues } from "../schemas/item.schema";

interface ListingFormProps {
  onCreated?: () => void;
}

const selectClasses = cn(
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-subtle",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "transition-colors duration-200",
);

/**
 * The "sell" form. On success it resets itself and notifies the parent
 * so the my-listings grid can refetch.
 */
export const ListingForm = ({ onCreated }: ListingFormProps) => {
  const { user } = useMe();
  const { categories } = useCategories();
  const hostelOptions = useMemo(
    () =>
      hostelsInViewerSegment(user?.hostelName).map((h) => ({
        value: h.name,
        label: h.name,
        group: h.segment === "boys" ? "Boys hostels" : "Girls hostels",
      })),
    [user?.hostelName],
  );
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ListingValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      category: "other",
      condition: "good",
      hostelName: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await itemsApi.create({
        title: values.title,
        description: values.description,
        price: values.price,
        category: values.category,
        condition: values.condition,
        hostelName: values.hostelName?.trim() || undefined,
      });
      toast.success("Listing published");
      reset();
      onCreated?.();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not publish listing"));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="border-border bg-muted/30 text-muted-foreground rounded-lg border px-3 py-2 text-xs leading-relaxed">
        Make sure your listing follows our{" "}
        <Link
          href="/prohibited-items"
          className="text-foreground font-medium underline underline-offset-4"
        >
          Prohibited Items Policy
        </Link>
        .
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="listing-title">Title</Label>
        <Input
          id="listing-title"
          placeholder="Scientific calculator (Casio fx-991ES)"
          aria-invalid={Boolean(errors.title)}
          {...register("title")}
        />
        <FieldError message={errors.title?.message} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="listing-price">Price (₹)</Label>
          <Input
            id="listing-price"
            type="number"
            min={0}
            placeholder="250"
            aria-invalid={Boolean(errors.price)}
            {...register("price")}
          />
          <FieldError message={errors.price?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="listing-hostel">Hostel (optional)</Label>
          <Controller
            control={control}
            name="hostelName"
            render={({ field }) => (
              <Select
                id="listing-hostel"
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Use profile hostel"
                options={hostelOptions}
                aria-invalid={Boolean(errors.hostelName)}
              />
            )}
          />
          <FieldError message={errors.hostelName?.message} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="listing-category">Category</Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <select
                id="listing-category"
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
          <Label htmlFor="listing-condition">Condition</Label>
          <Controller
            control={control}
            name="condition"
            render={({ field }) => (
              <select
                id="listing-condition"
                className={selectClasses}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              >
                {ITEM_CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          />
          <FieldError message={errors.condition?.message} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="listing-description">Description</Label>
        <Textarea
          id="listing-description"
          placeholder="Condition, age, reason for selling…"
          rows={5}
          aria-invalid={Boolean(errors.description)}
          {...register("description")}
        />
        <FieldError message={errors.description?.message} />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Publishing…" : "Publish listing"}
        </Button>
      </div>
    </form>
  );
};
