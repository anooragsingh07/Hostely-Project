"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/error-message";
import { interestsApi } from "../services/interests.api";

interface InterestButtonProps {
  itemId: string;
  disabled?: boolean;
  onChange?: (marked: boolean) => void;
}

/**
 * Toggles interest for the current user. The server is the source of truth —
 * we hydrate the initial state from `/items/:id/interests/me` on mount.
 */
export const InterestButton = ({ itemId, disabled, onChange }: InterestButtonProps) => {
  const [marked, setMarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    interestsApi
      .hasMarked(itemId)
      .then((v) => {
        if (!cancelled) setMarked(v);
      })
      .catch(() => {
        // Non-fatal — the button will default to "not marked".
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [itemId]);

  const toggle = async () => {
    setBusy(true);
    try {
      if (marked) {
        await interestsApi.unmark(itemId);
        setMarked(false);
        onChange?.(false);
        toast.success("Interest removed");
      } else {
        await interestsApi.mark(itemId);
        setMarked(true);
        onChange?.(true);
        toast.success("Interest sent to seller");
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not update interest"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant={marked ? "secondary" : "primary"}
      disabled={disabled || loading || busy}
      onClick={() => void toggle()}
    >
      <Heart className={marked ? "h-4 w-4 fill-current" : "h-4 w-4"} />
      {marked ? "Interested" : "Mark interest"}
    </Button>
  );
};
