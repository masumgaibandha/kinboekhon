import { Section, TextArea, TextField, Toggle } from "@/components/admin/form/fields";
import type { HelpPopupSettings } from "@/lib/validation/settings";

interface HelpPopupFieldsProps {
  popup: HelpPopupSettings;
  errors: Record<string, string>;
}

export function HelpPopupFields({ popup, errors }: HelpPopupFieldsProps) {
  return (
    <Section
      title="Help popup"
      description="Desktop only: shown once a day when the mouse leaves the top of a product or landing page after 10 seconds. A number sent from it shows as a Callback request in Incomplete orders. Bangla."
    >
      <div className="sm:col-span-2">
        <Toggle name="helpPopup.enabled" label="Show the help popup" defaultChecked={popup.enabled} />
      </div>
      <TextField name="helpPopup.title" label="Title" defaultValue={popup.title} error={errors["helpPopup.title"]} />
      <TextArea
        name="helpPopup.text"
        label="Text"
        defaultValue={popup.text}
        error={errors["helpPopup.text"]}
        hint="Shown above the phone field. The WhatsApp link uses the WhatsApp number above."
        rows={2}
      />
    </Section>
  );
}
