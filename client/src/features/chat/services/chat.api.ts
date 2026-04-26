import type { ChatMessage, Conversation, SendChatMessagePayload } from "@hostely/shared";
import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope } from "@/lib/api-types";

interface ConversationsResponse {
  conversations: Conversation[];
  unreadCount: number;
}

interface ThreadResponse {
  messages: ChatMessage[];
}

interface SendResponse {
  message: ChatMessage;
}

export const chatApi = {
  async conversations(): Promise<ConversationsResponse> {
    const res = await apiClient.get<ApiEnvelope<ConversationsResponse>>("/chat/conversations");
    return res.data.data;
  },

  async thread(peerId: string): Promise<ChatMessage[]> {
    const res = await apiClient.get<ApiEnvelope<ThreadResponse>>(`/chat/threads/${peerId}`);
    return res.data.data.messages;
  },

  async send(payload: SendChatMessagePayload): Promise<ChatMessage> {
    const res = await apiClient.post<ApiEnvelope<SendResponse>>("/chat/messages", payload);
    return res.data.data.message;
  },

  async markRead(peerId: string): Promise<void> {
    await apiClient.post(`/chat/threads/${peerId}/read`);
  },
};
