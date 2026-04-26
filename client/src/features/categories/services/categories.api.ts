import type { Category } from "@hostely/shared";
import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope } from "@/lib/api-types";

export const categoriesApi = {
  /** Active categories — the list every filter and form dropdown renders. */
  async list(): Promise<Category[]> {
    const res = await apiClient.get<ApiEnvelope<{ categories: Category[] }>>("/categories");
    return res.data.data.categories;
  },

  /** Admin-only — includes retired (`active: false`) categories. */
  async listAll(): Promise<Category[]> {
    const res = await apiClient.get<ApiEnvelope<{ categories: Category[] }>>("/categories/all");
    return res.data.data.categories;
  },

  async create(input: { slug: string; label: string }): Promise<Category> {
    const res = await apiClient.post<ApiEnvelope<{ category: Category }>>("/categories", input);
    return res.data.data.category;
  },

  /** Soft-retires a seeded category or hard-deletes an admin-created one. */
  async remove(slug: string): Promise<Category | null> {
    const res = await apiClient.delete<ApiEnvelope<{ category: Category | null }>>(
      `/categories/${slug}`,
    );
    return res.data.data.category;
  },

  async restore(slug: string): Promise<Category> {
    const res = await apiClient.post<ApiEnvelope<{ category: Category }>>(
      `/categories/${slug}/restore`,
    );
    return res.data.data.category;
  },
};
