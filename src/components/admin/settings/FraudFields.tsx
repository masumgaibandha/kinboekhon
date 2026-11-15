import { Section, TextField } from "@/components/admin/form/fields";
import type { FraudSettings } from "@/lib/fraud/risk";

interface FraudFieldsProps {
  fraud: FraudSettings;
  errors: Record<string, string>;
}

// Risk label thresholds for the order page Delivery history card. Cancelled and returned parcels count as failed.
export function FraudFields({ fraud, errors }: FraudFieldsProps) {
  const field = (key: keyof FraudSettings, label: string, hint: string) => (
    <TextField
      name={`fraud.${key}`}
      label={label}
      defaultValue={String(fraud[key])}
      error={errors[`fraud.${key}`]}
      hint={hint}
      numeric
    />
  );

  return (
    <Section
      title="Fraud check"
      description="Admin only. No history is Unknown. High comes first, then Check, else Low. A label never cancels an order."
    >
      {field("highMinFailed", "High: at least this many failed parcels", "Cancelled or returned, from all sources together.")}
      {field("highFailPercent", "High: and at least this failed percent", "0 to 100.")}
      {field("minRecords", "Check: fewer parcels than this", "Too little history to trust.")}
      {field("checkFailPercent", "Check: failed percent at or above", "0 to 100. Mixed history.")}
      {field("bookingMoney", "Booking money to ask (taka)", "Shown on High risk orders.")}
    </Section>
  );
}
