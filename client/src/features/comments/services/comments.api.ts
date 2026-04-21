import type { Comment, CommentParentType } from "@hostely/shared";
import { apiClient } from "@/lib/api-client";

const base = (parentType: CommentParentType, parentId: string): string =>
  parentType === "item" ? `/items/${parentId}/comments` : `/requirements/${parentId}/comments`;

export const commentsApi = {
  list: async (parentType: CommentParentType, parentId: string): Promise<Comment[]> => {
    const { data } = await apiClient.get<{ data: { comments: Comment[] } }>(
      base(parentType, parentId),
    );
    return data.data.comments;
  },

  add: async (parentType: CommentParentType, parentId: string, body: string): Promise<Comment> => {
    const { data } = await apiClient.post<{ data: { comment: Comment } }>(
      base(parentType, parentId),
      { body },
    );
    return data.data.comment;
  },

  remove: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/comments/${commentId}`);
  },
};
