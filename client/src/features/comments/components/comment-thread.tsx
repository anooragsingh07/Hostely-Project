"use client";

import type { Comment, CommentParentType, PublicUser } from "@hostely/shared";
import { MARKETPLACE_LIMITS } from "@hostely/shared";
import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatRelative } from "@/lib/format";
import { commentsApi } from "../services/comments.api";

interface CommentThreadProps {
  parentType: CommentParentType;
  parentId: string;
  currentUser: PublicUser | null;
}

interface ApiError {
  message?: string;
}

/**
 * Threaded comment surface. Fetches once on mount, then manages writes
 * in-place rather than re-fetching the full list every time.
 */
export const CommentThread = ({ parentType, parentId, currentUser }: CommentThreadProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    commentsApi
      .list(parentType, parentId)
      .then((items) => {
        if (!cancelled) setComments(items);
      })
      .catch((e: ApiError) => toast.error(e.message ?? "Could not load comments"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [parentType, parentId]);

  const onSubmit = useCallback(async () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const created = await commentsApi.add(parentType, parentId, trimmed);
      setComments((prev) => [...prev, created]);
      setBody("");
    } catch (e) {
      toast.error((e as ApiError).message ?? "Could not post comment");
    } finally {
      setSubmitting(false);
    }
  }, [body, parentType, parentId]);

  const onDelete = useCallback(async (id: string) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await commentsApi.remove(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      toast.error((e as ApiError).message ?? "Could not delete comment");
    }
  }, []);

  return (
    <div className="space-y-4">
      {currentUser ? (
        <div className="space-y-2">
          <Textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Ask a question or leave a message…"
            maxLength={MARKETPLACE_LIMITS.COMMENT_MAX}
            disabled={submitting}
          />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">
              {body.length}/{MARKETPLACE_LIMITS.COMMENT_MAX}
            </span>
            <Button
              size="sm"
              onClick={() => void onSubmit()}
              disabled={submitting || body.trim().length === 0}
            >
              {submitting ? "Posting…" : "Post comment"}
            </Button>
          </div>
        </div>
      ) : null}

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border-border space-y-1.5 rounded-lg border p-4">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      )}

      {!loading && comments.length === 0 && (
        <p className="text-muted-foreground text-sm">No comments yet.</p>
      )}

      {!loading &&
        comments.map((c) => (
          <div key={c.id} className="border-border bg-background rounded-lg border p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">{c.author.name}</span>
                <span className="text-muted-foreground text-xs">{c.author.hostelName}</span>
                <span className="text-muted-foreground text-xs">
                  · {formatRelative(c.createdAt)}
                </span>
              </div>
              {currentUser?.id === c.author.id && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete comment"
                  onClick={() => void onDelete(c.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-foreground mt-2 whitespace-pre-wrap text-sm">{c.body}</p>
          </div>
        ))}
    </div>
  );
};
