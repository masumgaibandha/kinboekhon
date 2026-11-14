"use client";

import { useState, type FormEvent } from "react";

import { updateOrderCustomer } from "@/app/admin/(panel)/orders/actions";
import { TextArea, TextField } from "@/components/admin/form/fields";
import { AdminLocationFields } from "@/components/admin/orders/AdminLocationFields";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";
import { INITIAL_VALUES_FIELD } from "@/lib/changed-fields";
import type { LocationSelection } from "@/lib/locations/types";
import type { CustomerFields } from "@/lib/validation/admin-order";

interface CustomerEditFormProps {
  orderNumber: string;
  initial: CustomerFields;
  onClose: () => void;
}

export function CustomerEditForm({ orderNumber, initial, onClose }: CustomerEditFormProps) {
  const { submit, pending, errors } = useAdminAction("order-customer", onClose);
  const [selection, setSelection] = useState<LocationSelection>({
    divisionId: initial.divisionId,
    districtId: initial.districtId,
    upazilaId: initial.upazilaId,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(updateOrderCustomer, new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <input type="hidden" name={INITIAL_VALUES_FIELD} value={JSON.stringify(initial)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="name" label="Name" defaultValue={initial.name} error={errors.name} />
        <TextField name="phone" label="Phone" defaultValue={initial.phone} error={errors.phone} numeric />
      </div>

      <AdminLocationFields selection={selection} onSelection={setSelection} errors={errors} />
      <TextArea name="address" label="Address (house, road, area)" defaultValue={initial.address} error={errors.address} rows={2} />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save customer"}
        </button>
        <button type="button" onClick={onClose} className="text-sm font-medium text-desc hover:text-brand">
          Cancel
        </button>
      </div>
    </form>
  );
}
