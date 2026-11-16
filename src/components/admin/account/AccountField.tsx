import { PasswordInput } from "@/components/admin/PasswordInput";

const fieldClass = "w-full rounded-lg border bg-card px-3 py-2 text-body outline-none focus:border-brand";

interface AccountFieldProps {
  id: string;
  name: string;
  label: string;
  type: "email" | "current-password" | "new-password";
  error?: string;
  hint?: string;
}

export function AccountField({ id, name, label, type, error, hint }: AccountFieldProps) {
  const className = `${fieldClass} ${error ? "border-brand-dark" : "border-line-strong"}`;
  const note = error ?? hint;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-body">
        {label}
      </label>
      {type === "email" ? (
        <input
          id={id}
          name={name}
          type="email"
          required
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          className={`mt-1 ${className}`}
        />
      ) : (
        <PasswordInput id={id} name={name} autoComplete={type} invalid={Boolean(error)} className={className} />
      )}
      {note && <p className={`mt-1 text-sm ${error ? "text-brand-dark" : "text-muted"}`}>{note}</p>}
    </div>
  );
}
