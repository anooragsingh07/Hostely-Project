import type { Notification } from "@hostely/shared";
import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope } from "@/lib/api-types";

interface ListResponse {
  notifications: Notification[];
  unreadCount: number;
}

export const notificationsApi = {
  async list(): Promise<ListResponse> {
    const res = await apiClient.get<ApiEnvelope<ListResponse>>("/notifications");
    return res.data.data;
  },

  async markRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await apiClient.post("/notifications/read-all");
  },
};
