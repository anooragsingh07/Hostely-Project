import { cn } from "@/lib/cn";

export const FieldError = ({ message, className }: { message?: string; className?: string }) => {
  if (!message) return null;
  return (
    <p
      role="alert"
      className={cn("text-xs text-destructive mt-1.5 animate-fade-in", className)}
    >
      {message}
    </p>
  );
};
