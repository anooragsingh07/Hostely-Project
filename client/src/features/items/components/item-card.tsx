import type { Item } from "@hostely/shared";
import { hostelDistance } from "@hostely/shared";
import { Heart, MapPin } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatPrice, formatRelative } from "@/lib/format";
import { cn } from "@/lib/cn";

interface ItemCardProps {
  item: Item;
  /** Optional viewer hostel — enables "Same hostel" / "Nearby" badge styling. */
  viewerHostel?: string;
}

const proximityBadge = (distance: 0 | 1 | 2) => {
  if (distance === 0) {
    return { label: "Same hostel", variant: "success" as const };
  }
  if (distance === 1) {
    return { label: "Nearby", variant: "default" as const };
  }
  return null;
};

/**
 * Feed / grid presentation for a single listing.
 * Clickable surface navigates to the detail page.
 */
export const ItemCard = ({ item, viewerHostel }: ItemCardProps) => {
  const badge = viewerHostel ? proximityBadge(hostelDistance(viewerHostel, item.hostelName)) : null;

  return (
    <Link href={`/dashboard/items/${item.id}`} className="group block focus-visible:outline-none">
      <Card
        className={cn(
          "group-hover:border-foreground/20 group-focus-visible:ring-ring h-full overflow-hidden transition-colors duration-200 group-focus-visible:ring-2",
          badge?.variant === "success" && "border-primary/30",
        )}
      >
        <div className="bg-muted relative aspect-[4/3] w-full">
          {item.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.images[0]}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="text-muted-foreground flex h-full w-full items-center justify-center text-xs uppercase tracking-wide">
              {item.category}
            </div>
          )}
          {badge && (
            <div className="absolute left-3 top-3">
              <Badge variant={badge.variant} className="shadow-subtle">
                {badge.label}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="space-y-2 p-5 pt-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-1 text-base font-semibold tracking-tight">{item.title}</h3>
            <span className="shrink-0 text-sm font-semibold tabular-nums">
              {formatPrice(item.price)}
            </span>
          </div>
          <p className="text-muted-foreground line-clamp-2 text-sm">{item.description}</p>
        </CardContent>

        <CardFooter className="flex items-center justify-between gap-3 p-5 pt-0">
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Badge variant="outline" className="capitalize">
              {item.category}
            </Badge>
            <Badge variant="outline" className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {item.hostelName}
            </Badge>
          </div>
          <div className="text-muted-foreground flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {item.interestsCount}
            </span>
            <span>{formatRelative(item.createdAt)}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};
