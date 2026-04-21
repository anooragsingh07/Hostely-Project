import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
  /** Optional grouping label; options with the same group cluster together. */
  group?: string;
}

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  /** Flat list of options. When grouped, options with the same `group` are wrapped in an optgroup. */
  options: readonly SelectOption[];
  /** Value shown when nothing is selected. Maps to the empty-string value. */
  placeholder?: string;
};

/**
 * Minimal styled <select>. Matches the Input design (height, radii, colors)
 * and stays fully keyboard + a11y accessible by delegating to the native
 * control. We reach for this instead of a Radix combobox whenever a flat
 * list of choices is sufficient — simpler, smaller bundle, zero portal.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, value, onChange, ...props }, ref) => {
    const groups = React.useMemo(() => {
      const map = new Map<string, SelectOption[]>();
      options.forEach((o) => {
        const key = o.group ?? "";
        const existing = map.get(key);
        if (existing) existing.push(o);
        else map.set(key, [o]);
      });
      return Array.from(map.entries());
    }, [options]);

    return (
      <div className={cn("relative inline-flex w-full", className)}>
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          className={cn(
            "border-input bg-background shadow-subtle h-10 w-full appearance-none rounded-lg border px-3 pr-9 text-sm",
            "focus-visible:ring-ring ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-200",
          )}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {groups.map(([group, opts]) =>
            group ? (
              <optgroup key={group} label={group}>
                {opts.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ) : (
              opts.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))
            ),
          )}
        </select>
        <ChevronDown
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
        />
      </div>
    );
  },
);
Select.displayName = "Select";
