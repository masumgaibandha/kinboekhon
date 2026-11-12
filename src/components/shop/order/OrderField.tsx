import type { ReactNode } from "react";

interface OrderFieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

export const fieldClass =
  "w-full rounded-md border border-line-strong bg-card p-3 text-base text-body outline-none placeholder:text-muted focus:border-brand aria-invalid:border-brand-dark";
export const labelClass = "mb-1.5 block text-[15px] font-semibold text-body";

export function OrderField({ id, label, error, children }: OrderFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-brand-dark">
          {error}
        </p>
      )}
    </div>
  );
}
