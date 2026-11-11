import { SelectField, TextField, Toggle } from "@/components/admin/form/fields";
import { ACCOUNT_TYPES } from "@/lib/account-types";
import type { WalletSettings } from "@/lib/validation/settings";

interface WalletFieldsProps {
  prefix: string;
  title: string;
  wallet: WalletSettings;
  errors: Record<string, string>;
  hint: string;
}

export function WalletFields({ prefix, title, wallet, errors, hint }: WalletFieldsProps) {
  return (
    <div className="rounded-lg border border-line p-4 sm:col-span-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-heading">{title}</h3>
        <Toggle name={`${prefix}.enabled`} label="Enabled" defaultChecked={wallet.enabled} />
      </div>
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
          defaultValue={wallet.accountType}
          options={ACCOUNT_TYPES}
        />
      </div>
    </div>
  );
}
