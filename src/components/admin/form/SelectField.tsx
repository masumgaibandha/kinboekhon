import { inputClass } from "@/components/admin/form/fields";

interface SelectFieldProps {
  name: string;
  label: string;
  defaultValue: string;
  options: readonly string[];
  // An empty first choice, for a value the admin still has to pick.
  placeholder?: string;
  error?: string;
}

export function SelectField({ name, label, defaultValue, options, placeholder, error }: SelectFieldProps) {
  const id = name.replace(".", "-");

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-body">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-note` : undefined}
        className={`${inputClass} ${error ? "border-brand-dark" : "border-line-strong"} capitalize`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-note`} className="mt-1 text-sm text-brand-dark">
          {error}
        </p>
      )}
    </div>
  );
}
