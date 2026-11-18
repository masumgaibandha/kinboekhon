import type { ReactNode } from "react";

interface StepFieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

const base =
  "block w-full rounded-xl border border-line-strong bg-card text-base text-body outline-none transition-shadow placeholder:text-muted focus:border-brand focus:ring-3 focus:ring-brand/25 aria-invalid:border-brand-dark";

// Order form fields: 48px tall, 12px radius, orange focus ring.
export const inputClass = `${base} h-12 px-4`;
export const selectClass = `${base} h-12 px-3 disabled:bg-page disabled:text-muted`;
export const textareaClass = `${base} min-h-24 resize-none px-4 py-3`;
export const stepLabelClass = "mb-2 block text-sm font-semibold text-body";

export function StepField({ id, label, error, children }: StepFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={stepLabelClass}>
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm font-medium text-brand-dark">
          {error}
        </p>
      )}
    </div>
  );
}
