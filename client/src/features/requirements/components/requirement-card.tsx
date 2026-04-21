import type { Requirement } from "@hostely/shared";
import { MapPin, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice, formatRelative } from "@/lib/format";

interface RequirementCardProps {
  requirement: Requirement;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
}

export const RequirementCard = ({ requirement, canDelete, onDelete }: RequirementCardProps) => (
  <Card>
    <CardContent className="space-y-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="text-base font-semibold tracking-tight">{requirement.title}</h3>
          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline" className="capitalize">
              {requirement.category}
            </Badge>
            {requirement.budgetMax !== undefined && (
              <span className="tabular-nums">Up to {formatPrice(requirement.budgetMax)}</span>
            )}
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {requirement.hostelName}
            </span>
            <span>·</span>
            <span>{formatRelative(requirement.createdAt)}</span>
          </div>
        </div>
        {canDelete && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete requirement"
            onClick={() => onDelete(requirement.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="text-muted-foreground text-sm">{requirement.description}</p>
      <p className="text-muted-foreground text-xs">
        Posted by <span className="text-foreground">{requirement.author.name}</span> ·{" "}
        {requirement.author.hostelName}
      </p>
    </CardContent>
  </Card>
);
