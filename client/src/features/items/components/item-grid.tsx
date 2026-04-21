import type { Item } from "@hostely/shared";
import { PackageSearch } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ItemCard } from "./item-card";

interface ItemGridProps {
  items: Item[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Passed through to ItemCard so proximity badges can render. */
  viewerHostel?: string;
}

export const ItemGrid = ({
  items,
  loading,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  viewerHostel,
}: ItemGridProps) => {
  if (loading) return <ItemGridSkeleton />;
  if (items.length === 0) {
    return <EmptyState icon={PackageSearch} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="gap-gutter grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} viewerHostel={viewerHostel} />
      ))}
    </div>
  );
};

const ItemGridSkeleton = () => (
  <div className="gap-gutter grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <Skeleton className="aspect-[4/3] w-full rounded-none" />
        <CardContent className="space-y-2 p-5 pt-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </CardContent>
        <CardFooter className="gap-2 p-5 pt-0">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </CardFooter>
      </Card>
    ))}
  </div>
);
