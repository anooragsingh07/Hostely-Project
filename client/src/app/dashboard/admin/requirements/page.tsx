"use client";

import type { Paginated, Requirement, RequirementStatus } from "@hostely/shared";
import { REQUIREMENT_STATUSES } from "@hostely/shared";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Pencil,
  RotateCcw,
  Search,
  ShieldOff,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AdminGuard } from "@/features/admin/components/admin-guard";
import { adminApi } from "@/features/admin/services/admin.api";
import { getApiErrorMessage } from "@/lib/error-message";

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  ...REQUIREMENT_STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })),
];

const BADGE: Record<RequirementStatus, "default" | "success" | "warning" | "destructive"> = {
  open: "success",
  fulfilled: "default",
  closed: "warning",
  removed: "destructive",
};

export default function AdminRequirementsPage() {
  const [data, setData] = useState<Paginated<Requirement> | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<RequirementStatus | "">("");
  const [q, setQ] = useState("");
  const [qDraft, setQDraft] = useState("");
  const [edit, setEdit] = useState<Requirement | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await adminApi.listRequirements({
        page,
        pageSize: PAGE_SIZE,
        status: status === "" ? undefined : status,
        q: q || undefined,
      });
      setData(res);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load requirements"));
    } finally {
      setLoading(false);
    }
  }, [page, status, q]);

  useEffect(() => {
    void load();
  }, [load]);

  const openEdit = (r: Requirement): void => {
    setEdit(r);
    setEditTitle(r.title);
    setEditDescription(r.description);
  };

  const saveEdit = async (): Promise<void> => {
    if (!edit) return;
    setSaving(true);
    try {
      await adminApi.updateRequirement(edit.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      toast.success("Requirement updated");
      setEdit(null);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Update failed"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (r: Requirement): Promise<void> => {
    if (!window.confirm(`Remove "${r.title}" from the board?`)) return;
    setMutating(r.id);
    try {
      await adminApi.removeRequirement(r.id);
      toast.success("Removed");
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Couldn't remove"));
    } finally {
      setMutating(null);
    }
  };

  const restore = async (r: Requirement): Promise<void> => {
    setMutating(r.id);
    try {
      await adminApi.restoreRequirement(r.id);
      toast.success("Restored");
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Couldn't restore"));
    } finally {
      setMutating(null);
    }
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <AdminGuard
      title="Requirements moderation"
      description="Remove or restore wanted posts; edit title and description when needed."
      actions={
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/admin">Overview</Link>
        </Button>
      }
    >
      <Dialog open={edit !== null} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit requirement</DialogTitle>
            <DialogDescription>Title and description only from this panel.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="rq-title">Title</Label>
              <Input
                id="rq-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rq-desc">Description</Label>
              <Textarea
                id="rq-desc"
                rows={4}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>
              Cancel
            </Button>
            <Button disabled={saving} onClick={() => void saveEdit()}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="gap-3">
          <CardTitle>Open & removed requirements</CardTitle>
          <CardDescription>Search and filter by moderation status.</CardDescription>
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setQ(qDraft.trim());
            }}
          >
            <div className="relative flex-1">
              <Search
                className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                aria-hidden
              />
              <Input
                value={qDraft}
                onChange={(e) => setQDraft(e.target.value)}
                placeholder="Search"
                className="pl-9"
              />
            </div>
            <div className="sm:w-48">
              <Select
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value as RequirementStatus | "");
                }}
                options={STATUS_OPTIONS}
              />
            </div>
            <Button type="submit" variant="outline">
              Apply
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          {loading && !data ? (
            <div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
              Loading…
            </div>
          ) : (data?.items.length ?? 0) === 0 ? (
            <div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
              No requirements match.
            </div>
          ) : (
            <ul className="divide-border divide-y">
              {data?.items.map((r) => {
                const isRemoved = r.status === "removed";
                return (
                  <li key={r.id} className="flex items-start justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{r.title}</span>
                        <Badge variant={BADGE[r.status] ?? "default"} className="capitalize">
                          {r.status}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {r.category}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                        {r.description}
                      </div>
                      <div className="text-muted-foreground mt-1 text-xs">
                        {r.author.name} · {r.hostelName}
                        {r.budgetMax != null ? ` · ≤₹${r.budgetMax.toLocaleString()}` : ""}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(r)}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <Link href="/dashboard/requirements">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      {isRemoved ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={mutating === r.id}
                          onClick={() => void restore(r)}
                        >
                          <RotateCcw className="h-4 w-4" />
                          Restore
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={mutating === r.id}
                          onClick={() => void remove(r)}
                        >
                          <ShieldOff className="h-4 w-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {data && data.total > 0 && (
            <div className="text-muted-foreground mt-4 flex items-center justify-between text-xs">
              <span>
                Page {data.page} of {totalPages} · {data.total} total
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminGuard>
  );
}
