"use client";

import { Plus } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Modal entry-point for creating a listing. Visual-only for now;
 * wire to the listings API when that module lands.
 */
export const NewListingDialog = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New listing
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a listing</DialogTitle>
          <DialogDescription>
            Share something you'd like to sell or swap within your hostel.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="listing-title">Title</Label>
            <Input id="listing-title" placeholder="e.g. Scientific calculator" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="listing-price">Price (₹)</Label>
              <Input id="listing-price" type="number" min="0" placeholder="250" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="listing-category">Category</Label>
              <Input id="listing-category" placeholder="Electronics" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="listing-description">Description</Label>
            <Textarea
              id="listing-description"
              placeholder="Condition, age, reason for selling…"
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Publish</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
