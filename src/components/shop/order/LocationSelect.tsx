import type { ReactNode } from "react";

import { OrderField, fieldClass } from "@/components/shop/order/OrderField";

interface SelectProps {
  id: string;
  name: string;
  label: string;
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
}

export function LocationSelect({ id, name, label, value, error, disabled, onChange, children }: SelectProps) {
  return (
    <OrderField id={id} label={label} error={error}>
      <select
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${fieldClass} disabled:bg-page disabled:text-muted`}
      >
        {children}
      </select>
    </OrderField>
  );
}
