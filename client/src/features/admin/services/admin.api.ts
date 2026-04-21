import type { AnalyticsSnapshot, Item, ItemStatus, Paginated } from "@hostely/shared";
import { apiClient } from "@/lib/api-client";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export interface AdminListItemsParams {
  page?: number;
  pageSize?: number;
  status?: ItemStatus;
  category?: string;
  hostelName?: string;
  q?: string;
}

export const adminApi = {
  async analytics(): Promise<AnalyticsSnapshot> {
    const res =
      await apiClient.get<ApiEnvelope<{ analytics: AnalyticsSnapshot }>>("/admin/analytics");
    return res.data.data.analytics;
  },

  async listItems(params: AdminListItemsParams = {}): Promise<Paginated<Item>> {
    const res = await apiClient.get<ApiEnvelope<Paginated<Item>>>("/admin/items", {
      params,
    });
    return res.data.data;
  },

  async removeItem(id: string): Promise<Item> {
    const res = await apiClient.post<ApiEnvelope<{ item: Item }>>(`/admin/items/${id}/remove`);
    return res.data.data.item;
  },

  async restoreItem(id: string): Promise<Item> {
    const res = await apiClient.post<ApiEnvelope<{ item: Item }>>(`/admin/items/${id}/restore`);
    return res.data.data.item;
  },
};
