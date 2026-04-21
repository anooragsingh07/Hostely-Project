import type { ItemCategory, Paginated, Requirement, RequirementListFilters } from "@hostely/shared";
import { apiClient } from "@/lib/api-client";

export interface CreateRequirementPayload {
  title: string;
  description: string;
  category: ItemCategory;
  budgetMax?: number;
  hostelName?: string;
}

const buildQuery = (f: RequirementListFilters): Record<string, string> => {
  const q: Record<string, string> = {};
  if (f.q) q.q = f.q;
  if (f.category) q.category = f.category;
  if (f.hostelName) q.hostelName = f.hostelName;
  if (f.status) q.status = f.status;
  if (f.mine) q.mine = "true";
  if (f.page) q.page = String(f.page);
  if (f.pageSize) q.pageSize = String(f.pageSize);
  return q;
};

export const requirementsApi = {
  list: async (filters: RequirementListFilters = {}): Promise<Paginated<Requirement>> => {
    const { data } = await apiClient.get<{ data: Paginated<Requirement> }>("/requirements", {
      params: buildQuery(filters),
    });
    return data.data;
  },

  get: async (id: string): Promise<Requirement> => {
    const { data } = await apiClient.get<{ data: { requirement: Requirement } }>(
      `/requirements/${id}`,
    );
    return data.data.requirement;
  },

  create: async (payload: CreateRequirementPayload): Promise<Requirement> => {
    const { data } = await apiClient.post<{ data: { requirement: Requirement } }>(
      "/requirements",
      payload,
    );
    return data.data.requirement;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/requirements/${id}`);
  },
};
