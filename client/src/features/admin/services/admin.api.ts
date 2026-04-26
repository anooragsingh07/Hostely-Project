import type {
  AnalyticsSnapshot,
  Item,
  ItemStatus,
  Paginated,
  PublicUser,
  Requirement,
  RequirementStatus,
} from "@hostely/shared";
import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope } from "@/lib/api-types";

export interface AdminListItemsParams {
  page?: number;
  pageSize?: number;
  status?: ItemStatus;
  category?: string;
  hostelName?: string;
  q?: string;
}

export interface AdminUpdateItemPayload {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  condition?: "new" | "like-new" | "good" | "fair";
  status?: ItemStatus;
  images?: string[];
}

export interface AdminListUsersParams {
  page?: number;
  pageSize?: number;
  q?: string;
}

export interface AdminPatchUserPayload {
  role?: "student" | "admin";
  banned?: boolean;
}

export interface AdminListRequirementsParams {
  page?: number;
  pageSize?: number;
  status?: RequirementStatus;
  category?: string;
  hostelName?: string;
  q?: string;
}

export interface AdminUpdateRequirementPayload {
  title?: string;
  description?: string;
  category?: string;
  budgetMax?: number;
  hostelName?: string;
  status?: RequirementStatus;
}

export interface AdminChatThreadSummary {
  threadKey: string;
  userA: string;
  userB: string;
  messageCount: number;
  lastBody: string;
  lastAt: string;
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

  async updateItem(id: string, payload: AdminUpdateItemPayload): Promise<Item> {
    const res = await apiClient.patch<ApiEnvelope<{ item: Item }>>(`/admin/items/${id}`, payload);
    return res.data.data.item;
  },

  async removeItem(id: string): Promise<Item> {
    const res = await apiClient.post<ApiEnvelope<{ item: Item }>>(`/admin/items/${id}/remove`);
    return res.data.data.item;
  },

  async restoreItem(id: string): Promise<Item> {
    const res = await apiClient.post<ApiEnvelope<{ item: Item }>>(`/admin/items/${id}/restore`);
    return res.data.data.item;
  },

  async listUsers(params: AdminListUsersParams = {}): Promise<Paginated<PublicUser>> {
    const res = await apiClient.get<ApiEnvelope<Paginated<PublicUser>>>("/admin/users", {
      params,
    });
    return res.data.data;
  },

  async patchUser(id: string, payload: AdminPatchUserPayload): Promise<PublicUser> {
    const res = await apiClient.patch<ApiEnvelope<{ user: PublicUser }>>(
      `/admin/users/${id}`,
      payload,
    );
    return res.data.data.user;
  },

  async resetUserPassword(id: string, newPassword: string): Promise<void> {
    await apiClient.post(`/admin/users/${id}/reset-password`, { newPassword });
  },

  async listRequirements(
    params: AdminListRequirementsParams = {},
  ): Promise<Paginated<Requirement>> {
    const res = await apiClient.get<ApiEnvelope<Paginated<Requirement>>>("/admin/requirements", {
      params,
    });
    return res.data.data;
  },

  async updateRequirement(
    id: string,
    payload: AdminUpdateRequirementPayload,
  ): Promise<Requirement> {
    const res = await apiClient.patch<ApiEnvelope<{ requirement: Requirement }>>(
      `/admin/requirements/${id}`,
      payload,
    );
    return res.data.data.requirement;
  },

  async removeRequirement(id: string): Promise<Requirement> {
    const res = await apiClient.post<ApiEnvelope<{ requirement: Requirement }>>(
      `/admin/requirements/${id}/remove`,
    );
    return res.data.data.requirement;
  },

  async restoreRequirement(id: string): Promise<Requirement> {
    const res = await apiClient.post<ApiEnvelope<{ requirement: Requirement }>>(
      `/admin/requirements/${id}/restore`,
    );
    return res.data.data.requirement;
  },

  async deleteComment(commentId: string): Promise<void> {
    await apiClient.delete(`/admin/comments/${commentId}`);
  },

  async listChatThreads(
    params: { page?: number; pageSize?: number } = {},
  ): Promise<Paginated<AdminChatThreadSummary>> {
    const res = await apiClient.get<ApiEnvelope<Paginated<AdminChatThreadSummary>>>(
      "/admin/chat/threads",
      { params },
    );
    return res.data.data;
  },

  async deleteChatMessage(messageId: string): Promise<void> {
    await apiClient.delete(`/admin/chat/messages/${messageId}`);
  },

  async purgeChatThread(userA: string, userB: string): Promise<{ deleted: number }> {
    const res = await apiClient.post<ApiEnvelope<{ deleted: number }>>(
      "/admin/chat/threads/purge",
      {
        userA,
        userB,
      },
    );
    return res.data.data;
  },
};
