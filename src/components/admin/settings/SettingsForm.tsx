"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import toast from "react-hot-toast";

import { saveSettings } from "@/app/admin/(panel)/settings/actions";
import { CostFields } from "@/components/admin/costs/CostFields";
import { Section, TextField, Toggle } from "@/components/admin/form/fields";
import { WalletFields } from "@/components/admin/settings/WalletFields";
import { INITIAL_VALUES_FIELD } from "@/lib/changed-fields";
import type { WalletKey } from "@/lib/settings";
import { COST_DEFAULT_KEYS } from "@/lib/validation/costs";
import type { AdminSettingsValues } from "@/lib/validation/settings";

type NumberKey = "fullAdvanceDiscount" | "duplicateWindowHours";

interface SettingsFormProps {
  settings: AdminSettingsValues;
  saved: AdminSettingsValues;
  reviewWallets: WalletKey[];
}

export function SettingsForm({ settings, saved, reviewWallets }: SettingsFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveSettings(formData);
      if (result.ok) {
        setErrors({});
        toast.dismiss("settings-error");
        toast.success("Settings saved.");
        router.refresh();
      } else {
        setErrors(result.fieldErrors);
        toast.error(result.message, { id: "settings-error" });
      }
    });
  }

  const amount = (name: NumberKey, label: string, hint?: string) => (
    <TextField
      name={name}
      label={label}
      defaultValue={String(settings[name])}
      error={errors[name]}
      hint={hint}
      numeric
    />
  );

  const walletHint = "Shown to customers who pay in advance.";
  const costDefaultStrings = Object.fromEntries(
    COST_DEFAULT_KEYS.map((key) => [key, String(settings.costDefaults[key])]),
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <input type="hidden" name={INITIAL_VALUES_FIELD} value={JSON.stringify(saved)} />
      <Section
        title="Advance payment discount"
        description="Delivery is free everywhere. This whole taka amount is taken off the order total when the customer pays the full amount in advance."
      >
        {amount("fullAdvanceDiscount", "Full amount paid in advance")}
      </Section>

      <Section title="Mobile wallets">
        <WalletFields prefix="bkash" title="bKash" wallet={settings.bkash} errors={errors} hint={walletHint} review={reviewWallets.includes("bkash")} />
        <WalletFields prefix="nagad" title="Nagad" wallet={settings.nagad} errors={errors} hint={walletHint} review={reviewWallets.includes("nagad")} />
        <WalletFields
          prefix="rocket"
          title="Rocket"
          wallet={settings.rocket}
          errors={errors}
          hint="11 or 12 digits. Shown to customers who pay in advance."
          review={reviewWallets.includes("rocket")}
        />
      </Section>

      <Section title="Bank transfer">
        <div className="sm:col-span-2">
          <Toggle name="bank.enabled" label="Enabled" defaultChecked={settings.bank.enabled} />
        </div>
        <TextField name="bank.bankName" label="Bank name" defaultValue={settings.bank.bankName} error={errors["bank.bankName"]} />
        <TextField name="bank.accountName" label="Account name" defaultValue={settings.bank.accountName} error={errors["bank.accountName"]} />
        <TextField name="bank.accountNumber" label="Account number" defaultValue={settings.bank.accountNumber} error={errors["bank.accountNumber"]} numeric />
        <TextField name="bank.branch" label="Branch" defaultValue={settings.bank.branch} error={errors["bank.branch"]} />
        <TextField name="bank.routingNumber" label="Routing number" defaultValue={settings.bank.routingNumber} error={errors["bank.routingNumber"]} numeric />
      </Section>

      <Section title="Contact" description="Shown to customers on the site.">
        <TextField name="supportPhone" label="Support phone" defaultValue={settings.supportPhone} error={errors.supportPhone} numeric placeholder="01XXXXXXXXX" />
        <TextField name="whatsappNumber" label="WhatsApp number" defaultValue={settings.whatsappNumber} error={errors.whatsappNumber} numeric placeholder="01XXXXXXXXX" />
      </Section>

      <Section title="Order protection">
        {amount("duplicateWindowHours", "Duplicate order window (hours)", "Same phone and product inside this window is blocked. 1 to 168.")}
      </Section>

      <Section
        title="Price calculator defaults"
        description="Admin only. A new product's price calculator starts with these values, and so does any product saved before the calculator existed."
      >
        <CostFields prefix="costDefaults" keys={COST_DEFAULT_KEYS} values={costDefaultStrings} errors={errors} />
      </Section>

      <div className="sticky bottom-0 -mx-4 border-t border-line bg-page/95 px-4 py-3">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-brand py-3 font-semibold text-white disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {pending ? "Saving..." : "Save settings"}
        </button>
      </div>
    </form>
  );
}
