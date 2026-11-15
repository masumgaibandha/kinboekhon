import { Section, TextField } from "@/components/admin/form/fields";
import type { CourierSettings } from "@/lib/validation/courier-settings";

interface CourierFieldsProps {
  courier: CourierSettings;
  errors: Record<string, string>;
}

// What the courier really takes per parcel, used by the price calculator and the profit report.
export function CourierFields({ courier, errors }: CourierFieldsProps) {
  const field = (key: keyof CourierSettings, label: string, hint?: string) => (
    <TextField
      name={`courier.${key}`}
      label={label}
      defaultValue={String(courier[key])}
      error={errors[`courier.${key}`]}
      hint={hint}
      numeric={key === "codPercent" ? "decimal" : true}
    />
  );

  return (
    <Section
      title="Courier cost"
      description="Admin only. What the courier charges us per parcel by weight with packaging, from Gaibandha. Above 2 kg the 2 kg rate is used."
    >
      {field("dhakaHalfKg", "Dhaka City, up to 0.5 kg")}
      {field("outsideHalfKg", "Outside, up to 0.5 kg")}
      {field("dhakaOneKg", "Dhaka City, up to 1 kg")}
      {field("outsideOneKg", "Outside, up to 1 kg")}
      {field("dhakaTwoKg", "Dhaka City, up to 2 kg")}
      {field("outsideTwoKg", "Outside, up to 2 kg")}
      {field("returnFeePercent", "Return fee (% of delivery cost)", "A returned parcel pays the delivery cost plus this. 0 to 100.")}
      {field("codPercent", "COD charge (%)", "Of the cash the courier collects. 0 to 20, one decimal.")}
    </Section>
  );
}
