import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./card";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * Consistent empty / zero-data presentation.
 * Keep the copy encouraging rather than apologetic.
 */
export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      {Icon && (
        <div className="bg-muted text-muted-foreground rounded-full p-3">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="space-y-1">
        <p className="text-foreground text-sm font-medium">{title}</p>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
      {action}
    </CardContent>
  </Card>
);
