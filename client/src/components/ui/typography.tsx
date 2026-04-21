import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Typography scale — the only approved way to render display text.
 * Import H1/H2/H3/Lead/Body/Muted rather than applying raw type classes.
 *
 *   H1   → Page title        (3xl / 4xl, semibold)
 *   H2   → Section title     (2xl / 3xl, semibold)
 *   H3   → Subsection title  (lg  / xl,  semibold)
 *   Lead → Introductory text (xl,  normal, muted)
 *   Body → Default paragraph (base)
 *   Muted→ Helper / captions (sm,  muted)
 */

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>;
type TextProps = React.HTMLAttributes<HTMLParagraphElement>;

export const H1 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h1
      ref={ref}
      className={cn(
        "text-3xl md:text-4xl font-semibold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  ),
);
H1.displayName = "H1";

export const H2 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        "text-2xl md:text-3xl font-semibold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  ),
);
H2.displayName = "H2";

export const H3 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg md:text-xl font-semibold tracking-tight text-foreground", className)}
      {...props}
    />
  ),
);
H3.displayName = "H3";

export const Lead = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-xl text-muted-foreground", className)} {...props} />
  ),
);
Lead.displayName = "Lead";

export const Body = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-base leading-7 text-foreground", className)} {...props} />
  ),
);
Body.displayName = "Body";

export const Muted = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
Muted.displayName = "Muted";
