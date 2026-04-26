"use client";

import type { ItemCategory } from "@hostely/shared";
import { hostelsInViewerSegment } from "@hostely/shared";
import { MapPin, Search, Sparkles, X } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { cn } from "@/lib/cn";

export interface ItemFilterValues {
  q: string;
  category: ItemCategory | "";
  hostelName: string;
  /** When on, results are sorted by proximity to the viewer's hostel (server-resolved). */
  sortByHostel: boolean;
}

interface ItemFiltersProps {
  value: ItemFilterValues;
  onChange: (next: ItemFilterValues) => void;
  onReset?: () => void;
  /** When set, hostel filter options are limited to the same campus segment (boys / girls). */
  viewerHostelName?: string;
}

/**
 * Search bar + category chips + hostel dropdown + nearest-first toggle.
 * Controlled component — the parent owns state and debounces as needed.
 */
export const ItemFilters = ({ value, onChange, onReset, viewerHostelName }: ItemFiltersProps) => {
  const { categories } = useCategories();
  const hostelOptions = useMemo(
    () =>
      hostelsInViewerSegment(viewerHostelName).map((h) => ({
        value: h.name,
        label: h.name,
        group: h.segment === "boys" ? "Boys hostels" : "Girls hostels",
      })),
    [viewerHostelName],
  );
  const dirty = Boolean(value.q || value.category || value.hostelName || value.sortByHostel);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            value={value.q}
            onChange={(e) => onChange({ ...value, q: e.target.value })}
            placeholder="Search titles or descriptions"
            className="pl-9"
            aria-label="Search"
          />
        </div>
        <div className="sm:w-56">
          <Select
            value={value.hostelName}
            onChange={(e) => onChange({ ...value, hostelName: e.target.value })}
            placeholder="All hostels"
            aria-label="Filter by hostel"
            options={hostelOptions}
          />
        </div>
        <NearestToggle
          active={value.sortByHostel}
          onToggle={() => onChange({ ...value, sortByHostel: !value.sortByHostel })}
        />
        {dirty && onReset && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="h-4 w-4" /> Clear
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <CategoryChip
          label="All"
          active={value.category === ""}
          onClick={() => onChange({ ...value, category: "" })}
        />
        {categories.map((cat) => (
          <CategoryChip
            key={cat.slug}
            label={cat.label}
            active={value.category === cat.slug}
            onClick={() => onChange({ ...value, category: cat.slug })}
          />
        ))}
      </div>
    </div>
  );
};

const NearestToggle = ({ active, onToggle }: { active: boolean; onToggle: () => void }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={active}
    title="Sort so listings from your hostel (then your zone) appear first"
    className={cn(
      "inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-colors duration-200",
      "focus-visible:ring-ring ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      active
        ? "bg-foreground text-background border-transparent"
        : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground shadow-subtle",
    )}
  >
    {active ? <Sparkles className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
    Nearest first
  </button>
);

const CategoryChip = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors duration-200",
      "focus-visible:ring-ring ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      active
        ? "bg-foreground text-background border-transparent"
        : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
    )}
  >
    {label}
  </button>
);
