"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Root route error UI — catches render errors in the `app` segment tree
 * (outside nested `error.tsx` files).
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <div className="border-border bg-card shadow-card flex max-w-md flex-col items-center gap-4 rounded-xl border p-8 text-center">
        <AlertTriangle className="text-destructive h-10 w-10" aria-hidden />
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Something went wrong</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            An unexpected error occurred. You can try again or return home.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button type="button" onClick={() => reset()}>
            Try again
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
