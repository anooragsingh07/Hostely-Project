import * as React from "react";
import { Input, type InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";

interface FormFieldProps extends InputProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ id, label, hint, error, ...props }, ref) => (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id}>{label}</Label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      <Input id={id} ref={ref} aria-invalid={Boolean(error)} {...props} />
      <FieldError message={error} />
    </div>
  ),
);
FormField.displayName = "FormField";
