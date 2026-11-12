import { SelectField } from "@/components/admin/form/SelectField";
import { TextField, Toggle } from "@/components/admin/form/fields";
import { ACCOUNT_TYPES } from "@/lib/account-types";
import type { WalletSettings } from "@/lib/validation/settings";

interface WalletFieldsProps {
  prefix: string;
  title: string;
  wallet: WalletSettings;
  errors: Record<string, string>;
  hint: string;
  // Saved with an account type that is no longer offered: hidden from the shop until a new type is saved.
  review: boolean;
}

export function WalletFields({ prefix, title, wallet, errors, hint, review }: WalletFieldsProps) {
  return (
    <div className="rounded-lg border border-line p-4 sm:col-span-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-heading">{title}</h3>
        <Toggle name={`${prefix}.enabled`} label="Enabled" defaultChecked={wallet.enabled} />
      </div>
      {review && (
        <p role="alert" className="mt-3 rounded-lg bg-brand-light px-3 py-2 text-sm font-medium text-brand-dark">
          This account was saved as an agent account, which is no longer offered. It is hidden from the shop. Choose
          Personal or Merchant and save.
        </p>
      )}
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <TextField
          name={`${prefix}.number`}
          label="Account number"
          defaultValue={wallet.number}
          error={errors[`${prefix}.number`]}
          hint={hint}
          numeric
          placeholder="01XXXXXXXXX"
        />
        <SelectField
          name={`${prefix}.accountType`}
          label="Account type"
          defaultValue={review ? "" : wallet.accountType}
          options={ACCOUNT_TYPES}
          placeholder={review ? "Choose an account type" : undefined}
          error={errors[`${prefix}.accountType`]}
        />
      </div>
    </div>
  );
}
