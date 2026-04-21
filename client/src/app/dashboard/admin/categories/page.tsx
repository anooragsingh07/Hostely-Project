"use client";

import type { Category } from "@hostely/shared";
import { type FormEvent, useEffect, useState } from "react";
import { Loader2, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminGuard } from "@/features/admin/components/admin-guard";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { categoriesApi } from "@/features/categories/services/categories.api";

interface ApiError {
  message?: string;
}

/** Normalizes a free-form label into a URL-safe slug for the slug input auto-fill. */
const slugify = (raw: string): string =>
  raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function AdminCategoriesPage() {
  const [allCategories, setAllCategories] = useState<Category[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState<string | null>(null);
  const { setCategories } = useCategories();

  const [label, setLabel] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  const refresh = async (): Promise<void> => {
    setLoading(true);
    try {
      const list = await categoriesApi.listAll();
      setAllCategories(list);
      // Keep the global dropdown cache fresh for every other open form.
      setCategories(list.filter((c) => c.active));
    } catch (err) {
      toast.error((err as ApiError).message ?? "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    const trimmedLabel = label.trim();
    const finalSlug = slug.trim() || slugify(trimmedLabel);
    if (!trimmedLabel || !finalSlug) {
      toast.error("Label and slug are required");
      return;
    }
    try {
      await categoriesApi.create({ slug: finalSlug, label: trimmedLabel });
      toast.success(`Added "${trimmedLabel}"`);
      setLabel("");
      setSlug("");
      setSlugEdited(false);
      await refresh();
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't create category");
    }
  };

  const onRemove = async (cat: Category): Promise<void> => {
    const verb = cat.seeded ? "retire" : "delete";
    if (!window.confirm(`Are you sure you want to ${verb} "${cat.label}"?`)) return;
    setMutating(cat.slug);
    try {
      await categoriesApi.remove(cat.slug);
      toast.success(cat.seeded ? "Category retired" : "Category deleted");
      await refresh();
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't remove category");
    } finally {
      setMutating(null);
    }
  };

  const onRestore = async (cat: Category): Promise<void> => {
    setMutating(cat.slug);
    try {
      await categoriesApi.restore(cat.slug);
      toast.success("Category restored");
      await refresh();
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't restore category");
    } finally {
      setMutating(null);
    }
  };

  return (
    <AdminGuard
      title="Categories"
      description="Add new taxonomy slugs or retire ones that no longer fit."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.5fr]">
        <Card>
          <CardHeader>
            <CardTitle>Add a category</CardTitle>
            <CardDescription>
              The slug is used internally on items and in the URL. Pick once — renames aren&apos;t
              reversible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onCreate}>
              <div className="space-y-1.5">
                <Label htmlFor="cat-label">Label</Label>
                <Input
                  id="cat-label"
                  placeholder="Musical instruments"
                  value={label}
                  onChange={(e) => {
                    setLabel(e.target.value);
                    if (!slugEdited) setSlug(slugify(e.target.value));
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cat-slug">Slug</Label>
                <Input
                  id="cat-slug"
                  placeholder="musical-instruments"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugEdited(true);
                  }}
                />
              </div>
              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4" />
                Add category
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All categories</CardTitle>
            <CardDescription>
              Seeded rows can be retired but not deleted — that preserves labels on historic
              listings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : (
              <ul className="divide-border divide-y">
                {(allCategories ?? []).map((cat) => (
                  <li key={cat.slug} className="flex items-center justify-between py-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {cat.label}
                        {cat.seeded && (
                          <Badge variant="outline" className="text-[10px] uppercase">
                            Seed
                          </Badge>
                        )}
                        {!cat.active && (
                          <Badge variant="warning" className="text-[10px] uppercase">
                            Retired
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground font-mono text-xs">{cat.slug}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {cat.active ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void onRemove(cat)}
                          disabled={mutating === cat.slug}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          {cat.seeded ? "Retire" : "Delete"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void onRestore(cat)}
                          disabled={mutating === cat.slug}
                        >
                          <RotateCcw className="h-4 w-4" />
                          Restore
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
                {allCategories?.length === 0 && (
                  <li className="text-muted-foreground py-6 text-sm">No categories yet.</li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
}
