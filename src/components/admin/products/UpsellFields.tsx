import { Section, inputClass } from "@/components/admin/form/fields";
import { MAX_EXTRAS } from "@/lib/orders/limits";

interface UpsellFieldsProps {
  // Every other product, active or not.
  options: { id: string; name: string }[];
  selected: string[];
  error?: string;
}

// Up to three products offered as "এটাও নিন" in this product's order summary.
export function UpsellFields({ options, selected, error }: UpsellFieldsProps) {
  return (
    <Section
      title="Upsell (এটাও নিন)"
      description="Shown in the order summary, in this order. Inactive products are skipped. Leave all empty to show other products from the same category."
    >
      {Array.from({ length: MAX_EXTRAS }, (_, index) => (
        <div key={index}>
          <label htmlFor={`upsell-${index}`} className="block text-sm font-medium text-body">
            Upsell product {index + 1}
          </label>
          <select
            id={`upsell-${index}`}
            name="upsellIds"
            defaultValue={selected[index] ?? ""}
            aria-invalid={error ? true : undefined}
            className={`${inputClass} ${error ? "border-brand-dark" : "border-line-strong"}`}
          >
            <option value="">None</option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      ))}
      {error && <p className="text-sm text-brand-dark sm:col-span-2">{error}</p>}
    </Section>
  );
}
