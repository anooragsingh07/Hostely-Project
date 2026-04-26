"use client";

import type { Paginated } from "@hostely/shared";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminGuard } from "@/features/admin/components/admin-guard";
import { adminApi, type AdminChatThreadSummary } from "@/features/admin/services/admin.api";
import { getApiErrorMessage } from "@/lib/error-message";

const PAGE_SIZE = 15;

export default function AdminContentPage() {
  const [commentId, setCommentId] = useState("");
  const [messageId, setMessageId] = useState("");
  const [purgeA, setPurgeA] = useState("");
  const [purgeB, setPurgeB] = useState("");
  const [busy, setBusy] = useState(false);
  const [threads, setThreads] = useState<Paginated<AdminChatThreadSummary> | null>(null);
  const [page, setPage] = useState(1);
  const [loadingThreads, setLoadingThreads] = useState(true);

  const loadThreads = useCallback(async (): Promise<void> => {
    setLoadingThreads(true);
    try {
      const res = await adminApi.listChatThreads({ page, pageSize: PAGE_SIZE });
      setThreads(res);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load chat threads"));
    } finally {
      setLoadingThreads(false);
    }
  }, [page]);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  const deleteComment = async (): Promise<void> => {
    const id = commentId.trim();
    if (!/^[a-f0-9]{24}$/i.test(id)) {
      toast.error("Enter a valid comment id");
      return;
    }
    if (!window.confirm("Delete this comment permanently?")) return;
    setBusy(true);
    try {
      await adminApi.deleteComment(id);
      toast.success("Comment deleted");
      setCommentId("");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Delete failed"));
    } finally {
      setBusy(false);
    }
  };

  const deleteMessage = async (): Promise<void> => {
    const id = messageId.trim();
    if (!/^[a-f0-9]{24}$/i.test(id)) {
      toast.error("Enter a valid message id");
      return;
    }
    if (!window.confirm("Delete this chat message?")) return;
    setBusy(true);
    try {
      await adminApi.deleteChatMessage(id);
      toast.success("Message deleted");
      setMessageId("");
      await loadThreads();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Delete failed"));
    } finally {
      setBusy(false);
    }
  };

  const purge = async (): Promise<void> => {
    const a = purgeA.trim();
    const b = purgeB.trim();
    if (!/^[a-f0-9]{24}$/i.test(a) || !/^[a-f0-9]{24}$/i.test(b)) {
      toast.error("Enter two valid user ids");
      return;
    }
    if (!window.confirm("Delete the entire DM thread between these users?")) return;
    setBusy(true);
    try {
      const { deleted } = await adminApi.purgeChatThread(a, b);
      toast.success(`Deleted ${deleted} message(s)`);
      setPurgeA("");
      setPurgeB("");
      await loadThreads();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Purge failed"));
    } finally {
      setBusy(false);
    }
  };

  const totalPages = threads ? Math.max(1, Math.ceil(threads.total / threads.pageSize)) : 1;

  return (
    <AdminGuard
      title="Content & chat"
      description="Delete individual comments or chat messages, or purge a whole DM thread."
      actions={
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/admin">Overview</Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
            <CardDescription>
              Remove a comment by MongoDB id (from logs or database tools).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="cid">Comment id</Label>
              <Input
                id="cid"
                value={commentId}
                onChange={(e) => setCommentId(e.target.value)}
                placeholder="24-char hex id"
              />
            </div>
            <Button variant="destructive" disabled={busy} onClick={() => void deleteComment()}>
              <Trash2 className="h-4 w-4" />
              Delete comment
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chat messages</CardTitle>
            <CardDescription>
              Delete one message by id, or wipe a full thread below.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="mid">Message id</Label>
              <Input
                id="mid"
                value={messageId}
                onChange={(e) => setMessageId(e.target.value)}
                placeholder="24-char hex id"
              />
            </div>
            <Button variant="destructive" disabled={busy} onClick={() => void deleteMessage()}>
              Delete message
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purge DM thread</CardTitle>
            <CardDescription>
              Two user ids (order does not matter). Removes all messages.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="pa">User A id</Label>
              <Input id="pa" value={purgeA} onChange={(e) => setPurgeA(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pb">User B id</Label>
              <Input id="pb" value={purgeB} onChange={(e) => setPurgeB(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Button variant="destructive" disabled={busy} onClick={() => void purge()}>
                Purge entire thread
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent threads</CardTitle>
            <CardDescription>Latest activity across campus DMs.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingThreads && !threads ? (
              <div className="text-muted-foreground py-8 text-center text-sm">Loading…</div>
            ) : (threads?.items.length ?? 0) === 0 ? (
              <div className="text-muted-foreground py-8 text-center text-sm">No messages yet.</div>
            ) : (
              <ul className="divide-border divide-y">
                {threads?.items.map((t) => (
                  <li key={t.threadKey} className="flex gap-3 py-3">
                    <MessageSquare className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium">
                        {t.userA.slice(-6)}… ↔ {t.userB.slice(-6)}… · {t.messageCount} msgs
                      </div>
                      <div className="text-muted-foreground line-clamp-2 text-xs">{t.lastBody}</div>
                      <div className="text-muted-foreground mt-1 text-[10px]">{t.lastAt}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {threads && threads.total > 0 && (
              <div className="text-muted-foreground mt-4 flex items-center justify-between text-xs">
                <span>
                  Page {threads.page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={page <= 1 || loadingThreads}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={page >= totalPages || loadingThreads}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
}
