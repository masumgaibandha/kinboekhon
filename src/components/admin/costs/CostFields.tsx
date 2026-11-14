import { TextField } from "@/components/admin/form/fields";
import type { CostKey } from "@/lib/validation/costs";

const FIELDS: Record<CostKey, { label: string; decimal?: boolean; hint?: string }> = {
  chinaPrice: { label: "China price (taka)" },
  weightGrams: { label: "Weight (grams)" },
  shippingPerKg: { label: "Air shipping (taka per kg)" },
  agentFee: { label: "Agent fee (taka)" },
  packaging: { label: "Packaging (taka)" },
  courier: { label: "Courier charge (taka)", hint: "Delivery is free for the customer, so this is our cost." },
  codPercent: { label: "COD charge (%)", decimal: true },
  returnPercent: { label: "Return rate (%)", decimal: true },
  adCost: { label: "Ad cost per order (taka)" },
  targetProfit: { label: "Target profit per order (taka)" },
};

interface CostFieldsProps {
  prefix: string;
  keys: readonly CostKey[];
  values: Partial<Record<CostKey, string>>;
  errors: Record<string, string>;
  onChange?: (key: CostKey, value: string) => void;
}

export function CostFields({ prefix, keys, values, errors, onChange }: CostFieldsProps) {
  return keys.map((key) => (
    <TextField
      key={key}
      name={`${prefix}.${key}`}
      label={FIELDS[key].label}
      defaultValue={values[key] ?? ""}
      error={errors[`${prefix}.${key}`]}
      hint={FIELDS[key].hint}
      numeric={FIELDS[key].decimal ? "decimal" : true}
      onChange={onChange ? (value) => onChange(key, value) : undefined}
    />
  ));
}
