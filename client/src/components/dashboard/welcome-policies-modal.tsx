"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * First-visit welcome after signup (`?welcome=1`). Dismiss strips the query param.
 */
export const WelcomePoliciesModal = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("welcome") === "1") setOpen(true);
  }, [searchParams]);

  const dismiss = (): void => {
    setOpen(false);
    router.replace("/dashboard");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && dismiss()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to Hostely!</DialogTitle>
          <DialogDescription>Quick tips so you stay in good standing on campus.</DialogDescription>
        </DialogHeader>
        <div className="text-muted-foreground space-y-3 text-sm">
          <p>
            Please follow our community guidelines and{" "}
            <Link
              href="/prohibited-items"
              className="text-foreground font-medium underline underline-offset-4"
            >
              prohibited items policy
            </Link>{" "}
            to avoid account restrictions.
          </p>
          <p>
            Review the{" "}
            <Link
              href="/terms-and-conditions"
              className="text-foreground font-medium underline underline-offset-4"
            >
              Terms &amp; Conditions
            </Link>{" "}
            anytime.
          </p>
        </div>
        <DialogFooter>
          <Button type="button" onClick={dismiss}>
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
