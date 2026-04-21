import type {
  Item,
  ItemCategory,
  ItemCondition,
  ItemListFilters,
  ItemStatus,
  Paginated,
} from "@hostely/shared";
import { apiClient } from "@/lib/api-client";

export interface CreateItemPayload {
  title: string;
  description: string;
  price: number;
  category: ItemCategory;
  condition: ItemCondition;
  hostelName?: string;
  images?: string[];
}

export interface UpdateItemPayload {
  title?: string;
  description?: string;
  price?: number;
  category?: ItemCategory;
  condition?: ItemCondition;
  status?: ItemStatus;
  images?: string[];
}

const buildQuery = (f: ItemListFilters): Record<string, string> => {
  const q: Record<string, string> = {};
  if (f.q) q.q = f.q;
  if (f.category) q.category = f.category;
  if (f.hostelName) q.hostelName = f.hostelName;
  if (f.nearHostel) q.nearHostel = f.nearHostel;
  if (f.sortByHostel) q.sortByHostel = "true";
  if (f.status) q.status = f.status;
  if (f.mine) q.mine = "true";
  if (f.page) q.page = String(f.page);
  if (f.pageSize) q.pageSize = String(f.pageSize);
  return q;
};

/**
 * REST client for the Item resource. All calls are cookie-authenticated
 * by the shared axios instance, so no token handling lives here.
 */
export const itemsApi = {
  list: async (filters: ItemListFilters = {}): Promise<Paginated<Item>> => {
    const { data } = await apiClient.get<{ data: Paginated<Item> }>("/items", {
      params: buildQuery(filters),
    });
    return data.data;
  },

  get: async (id: string): Promise<Item> => {
    const { data } = await apiClient.get<{ data: { item: Item } }>(`/items/${id}`);
    return data.data.item;
  },

  create: async (payload: CreateItemPayload): Promise<Item> => {
    const { data } = await apiClient.post<{ data: { item: Item } }>("/items", payload);
    return data.data.item;
  },

  update: async (id: string, payload: UpdateItemPayload): Promise<Item> => {
    const { data } = await apiClient.patch<{ data: { item: Item } }>(`/items/${id}`, payload);
    return data.data.item;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/items/${id}`);
  },
};
