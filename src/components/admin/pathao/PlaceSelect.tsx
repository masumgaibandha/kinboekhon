import type { PathaoPlace } from "@/lib/pathao/places";

interface PlaceSelectProps {
  name: string;
  label: string;
  value: string;
  places: PathaoPlace[];
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  hint?: string;
}

export function PlaceSelect({ name, label, value, places, placeholder, onChange, disabled, error, hint }: PlaceSelectProps) {
  const id = `pathao-${name}`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-body">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        className={`mt-1 w-full rounded-lg border bg-card px-3 py-2 text-sm text-body outline-none focus:border-brand ${
          error ? "border-brand-dark" : "border-line-strong"
        }`}
      >
        <option value="">{placeholder}</option>
        {places.map((place) => (
          <option key={place.id} value={place.id}>
            {place.name}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-sm text-brand-dark">{error}</p> : hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
