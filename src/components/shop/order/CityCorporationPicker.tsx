import { CITY_CORPORATIONS } from "@/lib/locations/dhaka";

interface CityCorporationPickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  labelClass: string;
}

// Two cards rather than a dropdown, so each choice can show its well-known areas underneath.
export function CityCorporationPicker({ value, onChange, error, labelClass }: CityCorporationPickerProps) {
  return (
    <fieldset aria-describedby={error ? "order-cityCorporation-error" : undefined}>
      <legend className={labelClass}>সিটি কর্পোরেশন</legend>
      <div className="space-y-2">
        {CITY_CORPORATIONS.map((corporation) => (
          <label
            key={corporation.id}
            className={`flex items-start gap-3 rounded-md border p-3 ${
              value === corporation.id ? "border-brand bg-brand-light" : error ? "border-brand-dark bg-card" : "border-line-strong bg-card"
            }`}
          >
            <input
              type="radio"
              name="cityCorporation"
              value={corporation.id}
              checked={value === corporation.id}
              onChange={() => onChange(corporation.id)}
              className="mt-1 accent-brand"
            />
            <span>
              <span className="block text-[15px] font-semibold text-body">{corporation.bn}</span>
              <span className="mt-0.5 block text-sm text-desc">{corporation.areas}</span>
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id="order-cityCorporation-error" className="mt-1.5 text-sm font-medium text-brand-dark">
          {error}
        </p>
      )}
    </fieldset>
  );
}
