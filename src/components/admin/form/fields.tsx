import type { ReactNode } from "react";

export const inputClass =
  "mt-1 w-full rounded-lg border bg-card px-3 py-2 text-body outline-none focus:border-brand";

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function Section({ title, description, children }: SectionProps) {
  return (
    <section className="rounded-xl border border-line bg-card p-5">
      <h2 className="text-lg font-semibold text-heading">{title}</h2>
      {description && <p className="mt-1 text-sm text-desc">{description}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

interface TextFieldProps {
  name: string;
  label: string;
  defaultValue: string;
  error?: string;
  hint?: string;
  numeric?: boolean | "decimal";
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function TextField({
  name,
  label,
  defaultValue,
  error,
  hint,
  numeric,
  placeholder,
  onChange,
}: TextFieldProps) {
  const inputMode = numeric === "decimal" ? "decimal" : numeric ? "numeric" : undefined;
  const id = name.replace(".", "-");
  const note = error ?? hint;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-body">
        {label}
      </label>
      <input
        id={id}
        name={name}
        defaultValue={defaultValue}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={note ? `${id}-note` : undefined}
        className={`${inputClass} ${error ? "border-brand-dark" : "border-line-strong"}`}
      />
      {note && (
        <p id={`${id}-note`} className={`mt-1 text-sm ${error ? "text-brand-dark" : "text-muted"}`}>
          {note}
        </p>
      )}
    </div>
  );
}

interface TextAreaProps {
  name: string;
  label: string;
  defaultValue: string;
  error?: string;
  hint?: string;
  rows?: number;
}

export function TextArea({ name, label, defaultValue, error, hint, rows = 3 }: TextAreaProps) {
  const id = name.replace(".", "-");
  const note = error ?? hint;

  return (
    <div className="sm:col-span-2">
      <label htmlFor={id} className="block text-sm font-medium text-body">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={note ? `${id}-note` : undefined}
        className={`${inputClass} ${error ? "border-brand-dark" : "border-line-strong"}`}
      />
      {note && (
        <p id={`${id}-note`} className={`mt-1 text-sm ${error ? "text-brand-dark" : "text-muted"}`}>
          {note}
        </p>
      )}
    </div>
  );
}

export function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm font-medium text-body">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="h-4 w-4 accent-brand" />
      {label}
    </label>
  );
}
