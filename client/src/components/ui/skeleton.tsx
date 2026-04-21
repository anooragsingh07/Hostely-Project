import { cn } from "@/lib/cn";

export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("bg-muted animate-pulse rounded-md", className)} {...props} />
);
