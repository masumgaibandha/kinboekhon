"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

import { saveSmsSettings } from "@/app/admin/(panel)/settings/sms-actions";
import { Section, TextField } from "@/components/admin/form/fields";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";
import { SmsTemplateField } from "@/components/admin/sms/SmsTemplateField";
import { INITIAL_VALUES_FIELD } from "@/lib/changed-fields";
import { AUTO_TEMPLATES } from "@/lib/sms/templates";
import type { SmsSettings } from "@/lib/validation/sms-settings";

interface SmsSettingsFormProps {
  sms: SmsSettings;
  connected: boolean;
}

export function SmsSettingsForm({ sms, connected }: SmsSettingsFormProps) {
  const router = useRouter();
  const { submit, pending, errors } = useAdminAction("sms-settings", () => router.refresh());

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(saveSmsSettings, new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input type="hidden" name={INITIAL_VALUES_FIELD} value={JSON.stringify(sms)} />
      <Section
        title="SMS"
        description="Bangla SMS to the customer. Each one goes out at most once per order, at most 5 SMS per phone a day, never to a Blocked customer. Placeholders: {name}, {order}, {amount} (order total), {track}."
      >
        {!connected && (
          <p className="rounded-lg bg-brand-light px-3 py-2 text-sm font-semibold text-brand-dark sm:col-span-2">
            SMS not connected. Nothing is sent: each SMS is only written to the SMS log.
          </p>
        )}
        <TextField
          name="pricePerPart"
          label="Price per SMS part (taka)"
          defaultValue={String(sms.pricePerPart)}
          error={errors.pricePerPart}
          hint="For the estimated monthly cost in the SMS log."
          numeric="decimal"
        />
        {AUTO_TEMPLATES.map((key) => (
          <SmsTemplateField
            key={key}
            template={key}
            enabled={sms.templates[key].enabled}
            text={sms.templates[key].text}
            error={errors[`templates.${key}.text`]}
          />
        ))}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand px-6 py-2.5 font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Saving..." : "Save SMS settings"}
          </button>
        </div>
      </Section>
    </form>
  );
}
