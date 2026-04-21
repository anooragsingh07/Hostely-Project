import type { Interest } from "@hostely/shared";
import { apiClient } from "@/lib/api-client";

export const interestsApi = {
  mark: async (itemId: string, note?: string): Promise<Interest> => {
    const { data } = await apiClient.post<{ data: { interest: Interest } }>(
      `/items/${itemId}/interests`,
      { note },
    );
    return data.data.interest;
  },

  unmark: async (itemId: string): Promise<void> => {
    await apiClient.delete(`/items/${itemId}/interests`);
  },

  hasMarked: async (itemId: string): Promise<boolean> => {
    const { data } = await apiClient.get<{ data: { marked: boolean } }>(
      `/items/${itemId}/interests/me`,
    );
    return data.data.marked;
  },

  list: async (itemId: string): Promise<Interest[]> => {
    const { data } = await apiClient.get<{ data: { interests: Interest[] } }>(
      `/items/${itemId}/interests`,
    );
    return data.data.interests;
  },
};
