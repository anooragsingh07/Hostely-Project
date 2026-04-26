"use client";

import type { Paginated, PublicUser } from "@hostely/shared";
import { ROLES } from "@hostely/shared";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, KeyRound, Search, Shield } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminGuard } from "@/features/admin/components/admin-guard";
import { adminApi } from "@/features/admin/services/admin.api";
import { getApiErrorMessage } from "@/lib/error-message";

const PAGE_SIZE = 15;

export default function AdminUsersPage() {
  const [data, setData] = useState<Paginated<PublicUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [qDraft, setQDraft] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resetFor, setResetFor] = useState<PublicUser | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await adminApi.listUsers({
        page,
        pageSize: PAGE_SIZE,
        q: q || undefined,
      });
      setData(res);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load users"));
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = async (
    user: PublicUser,
    body: { role?: "student" | "admin"; banned?: boolean },
  ) => {
    setBusyId(user.id);
    try {
      await adminApi.patchUser(user.id, body);
      toast.success("User updated");
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Update failed"));
    } finally {
      setBusyId(null);
    }
  };

  const submitReset = async (): Promise<void> => {
    if (!resetFor) return;
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setBusyId(resetFor.id);
    try {
      await adminApi.resetUserPassword(resetFor.id, newPassword);
      toast.success("Password reset");
      setResetFor(null);
      setNewPassword("");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Reset failed"));
    } finally {
      setBusyId(null);
    }
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <AdminGuard
      title="Users"
      description="Promote admins, suspend accounts, and reset passwords."
      actions={
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/admin">Overview</Link>
        </Button>
      }
    >
      {resetFor && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Reset password — {resetFor.name}</CardTitle>
            <CardDescription>
              Set a new password for this account (shown only here).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="new-pw">New password</Label>
              <Input
                id="new-pw"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setResetFor(null)}>
                Cancel
              </Button>
              <Button disabled={busyId === resetFor.id} onClick={() => void submitReset()}>
                Save password
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="gap-3">
          <CardTitle>Directory</CardTitle>
          <CardDescription>Search by name, email, or roll number.</CardDescription>
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
                placeholder="Search users"
                className="pl-9"
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
              No users found.
            </div>
          ) : (
            <ul className="divide-border divide-y">
              {data?.items.map((u) => (
                <li
                  key={u.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{u.name}</span>
                      {u.role === ROLES.ADMIN && (
                        <Badge variant="primary">
                          <Shield className="mr-1 h-3 w-3" />
                          Admin
                        </Badge>
                      )}
                      {u.banned && <Badge variant="destructive">Banned</Badge>}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {u.email} · {u.rollNo} · {u.hostelName}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === u.id}
                      onClick={() => setResetFor(u)}
                    >
                      <KeyRound className="h-4 w-4" />
                      Reset password
                    </Button>
                    {u.role === ROLES.STUDENT ? (
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={busyId === u.id}
                        onClick={() => void patch(u, { role: ROLES.ADMIN })}
                      >
                        Make admin
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === u.id}
                        onClick={() => void patch(u, { role: ROLES.STUDENT })}
                      >
                        Remove admin
                      </Button>
                    )}
                    {u.banned ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === u.id}
                        onClick={() => void patch(u, { banned: false })}
                      >
                        Unban
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={busyId === u.id}
                        onClick={() => void patch(u, { banned: true })}
                      >
                        Ban
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {data && data.total > 0 && (
            <div className="text-muted-foreground mt-4 flex items-center justify-between text-xs">
              <span>
                Page {data.page} of {totalPages} · {data.total} users
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
