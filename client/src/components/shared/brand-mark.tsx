import { cn } from "@/lib/cn";

export const BrandMark = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-2", className)}>
    <div
      aria-hidden
      className="h-7 w-7 rounded-md bg-foreground text-background grid place-items-center text-[13px] font-semibold tracking-tight"
    >
      H
    </div>
    <span className="text-sm font-semibold tracking-tight">Hostely</span>
  </div>
);
