import type { ReactNode } from "react";

import { StepField, selectClass } from "@/components/shop/order/StepField";

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
    <StepField id={id} label={label} error={error}>
      <select
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={selectClass}
      >
        {children}
      </select>
    </StepField>
  );
}
