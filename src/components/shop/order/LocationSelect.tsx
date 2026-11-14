import type { ReactNode } from "react";

import { OrderField, fieldClass } from "@/components/shop/order/OrderField";

interface SelectProps {
  id: string;
  name: string;
  label: string;
  value: string;
  error?: string;
  // A help line under the list.
  hint?: string;
  disabled: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
}

export function LocationSelect({ id, name, label, value, error, hint, disabled, onChange, children }: SelectProps) {
  return (
    <OrderField id={id} label={label} error={error}>
      <select
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={[error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined}
        className={`${fieldClass} disabled:bg-page disabled:text-muted`}
      >
        {children}
      </select>
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm leading-relaxed text-desc">
          {hint}
        </p>
      )}
    </OrderField>
  );
}
