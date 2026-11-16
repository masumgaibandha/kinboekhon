import { Section, TextField } from "@/components/admin/form/fields";
import type { AdminSettingsValues } from "@/lib/validation/settings";

interface BusinessFieldsProps {
  settings: AdminSettingsValues;
  errors: Record<string, string>;
}

const BADGE_LABELS = ["Trust icon 1 (cash)", "Trust icon 2 (delivery)", "Trust icon 3 (check first)"];

export function BusinessFields({ settings, errors }: BusinessFieldsProps) {
  return (
    <>
      <Section
        title="Business info"
        description="Shown to customers on the site. Trade license and address appear in the footer only when filled."
      >
        <TextField name="supportPhone" label="Support phone" defaultValue={settings.supportPhone} error={errors.supportPhone} numeric placeholder="01XXXXXXXXX" />
        <TextField name="whatsappNumber" label="WhatsApp number" defaultValue={settings.whatsappNumber} error={errors.whatsappNumber} numeric placeholder="01XXXXXXXXX" />
        <TextField name="tradeLicense" label="Trade license number" defaultValue={settings.tradeLicense} error={errors.tradeLicense} />
        <TextField
          name="businessAddress"
          label="Business address"
          defaultValue={settings.businessAddress}
          error={errors.businessAddress}
          hint="In Bangla, as customers should read it."
        />
      </Section>

      <Section title="Trust icons" description="The three short texts under the order button on product and landing pages. Bangla, 2 to 40 characters.">
        {BADGE_LABELS.map((label, index) => (
          <TextField
            key={label}
            name={`trustBadges.${index}`}
            label={label}
            defaultValue={settings.trustBadges[index]}
            error={errors[`trustBadges.${index}`]}
          />
        ))}
      </Section>
    </>
  );
}
