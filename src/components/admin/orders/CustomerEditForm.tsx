"use client";

import { useState, type FormEvent } from "react";

import { updateOrderCustomer } from "@/app/admin/(panel)/orders/actions";
import { TextArea, TextField } from "@/components/admin/form/fields";
import { AdminLocationFields } from "@/components/admin/orders/AdminLocationFields";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";
import { Money } from "@/components/ui/Money";
import { INITIAL_VALUES_FIELD } from "@/lib/changed-fields";
import { EMPTY_LOCATION, type LocationSelection } from "@/lib/locations/types";
import { DELIVERY_AREAS, DELIVERY_AREA_ADMIN_LABELS, type DeliveryArea } from "@/lib/orders/limits";
import { calculateOrder, type DeliveryCharges } from "@/lib/orders/pricing";
import type { CustomerFields } from "@/lib/validation/admin-order";

interface CustomerEditFormProps {
  orderNumber: string;
  initial: CustomerFields;
  charges: DeliveryCharges;
  price: number;
  quantity: number;
  // Advance payment orders keep their delivery area: the customer paid for it.
  areaLocked: boolean;
  onClose: () => void;
}

export function CustomerEditForm({ orderNumber, initial, charges, price, quantity, areaLocked, onClose }: CustomerEditFormProps) {
  const { submit, pending, errors } = useAdminAction("order-customer", onClose);
  const [area, setArea] = useState<DeliveryArea>(initial.deliveryArea);
  const [cityCorporation, setCityCorporation] = useState(initial.cityCorporation);
  const [selection, setSelection] = useState<LocationSelection>({
    divisionId: initial.divisionId,
    districtId: initial.districtId,
    upazilaId: initial.upazilaId,
  });

  // Same rule as the shop form: switching the area starts the location choice again.
  function changeArea(next: DeliveryArea) {
    setArea(next);
    setCityCorporation("");
    setSelection(EMPTY_LOCATION);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(updateOrderCustomer, new FormData(event.currentTarget));
  }

  const newAmounts = area === initial.deliveryArea ? null : calculateOrder(price, quantity, charges[area]);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <input type="hidden" name={INITIAL_VALUES_FIELD} value={JSON.stringify(initial)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="name" label="Name" defaultValue={initial.name} error={errors.name} />
        <TextField name="phone" label="Phone" defaultValue={initial.phone} error={errors.phone} numeric />
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-body">Delivery area</legend>
        <div className="mt-1 flex flex-wrap gap-4">
          {DELIVERY_AREAS.map((item) => (
            <label key={item} className="inline-flex items-center gap-2 text-sm text-body">
              <input
                type="radio"
                name="deliveryArea"
                value={item}
                checked={area === item}
                disabled={areaLocked}
                onChange={() => changeArea(item)}
                className="h-4 w-4 accent-brand"
              />
              {DELIVERY_AREA_ADMIN_LABELS[item]}
            </label>
          ))}
        </div>
        {(areaLocked || errors.deliveryArea) && (
          <p className={`mt-1 text-sm ${errors.deliveryArea ? "text-brand-dark" : "text-muted"}`}>
            {errors.deliveryArea ?? "The area can't be changed on an advance payment order."}
          </p>
        )}
      </fieldset>

      <AdminLocationFields
        area={area}
        cityCorporation={cityCorporation}
        onCityCorporation={setCityCorporation}
        selection={selection}
        onSelection={setSelection}
        errors={errors}
      />
      <TextArea name="address" label="Address (house, road, area)" defaultValue={initial.address} error={errors.address} rows={2} />

      {newAmounts && (
        <p role="status" className="rounded-lg bg-brand-light px-3 py-2 text-sm text-body">
          From Settings: delivery charge <Money amount={newAmounts.deliveryCharge} />, new total{" "}
          <Money amount={newAmounts.total} bold />.
        </p>
      )}

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
