"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

import { createAdSpend, updateAdSpend } from "@/app/admin/(panel)/ad-spend/actions";
import { inputClass, TextField } from "@/components/admin/form/fields";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";
import { Money } from "@/components/ui/Money";
import { usdToBdt } from "@/lib/ad-spend/usd-to-bdt";
import { INITIAL_VALUES_FIELD } from "@/lib/changed-fields";
import type { AdSpendInput } from "@/lib/validation/ad-spend";

interface AdSpendFormProps {
  products: { id: string; name: string }[];
  start: { day: string; productId: string; amountUsd: string; usdRate: string };
  today: string;
  // Present on the edit page: the entry and the values it was loaded with.
  edit?: { id: string; initial: AdSpendInput };
}

const DECIMAL = /^\d+(\.\d{1,2})?$/;

function previewBdt(amountUsd: string, usdRate: string): number | null {
  const usd = amountUsd.trim();
  const rate = usdRate.trim();
  return DECIMAL.test(usd) && DECIMAL.test(rate) ? usdToBdt(Number(usd), Number(rate)) : null;
}

export function AdSpendForm({ products, start, today, edit }: AdSpendFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [usd, setUsd] = useState(start.amountUsd);
  const [rate, setRate] = useState(start.usdRate);
  const { submit, pending, errors } = useAdminAction(edit ? `ad-spend-${edit.id}` : "ad-spend-new", () => {
    if (edit) return router.push("/admin/ad-spend");
    formRef.current?.reset();
    setUsd("");
    setRate(start.usdRate);
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(edit ? updateAdSpend : createAdSpend, new FormData(event.currentTarget));
  }

  const bdt = previewBdt(usd, rate);
  const fieldBorder = (name: string) => (errors[name] ? "border-brand-dark" : "border-line-strong");
  const note = (name: string) => errors[name] && <p className="mt-1 text-sm text-brand-dark">{errors[name]}</p>;

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      {edit && <input type="hidden" name="id" value={edit.id} />}
      {edit && <input type="hidden" name={INITIAL_VALUES_FIELD} value={JSON.stringify(edit.initial)} />}
      <div>
        <label htmlFor="ad-day" className="block text-sm font-medium text-body">
          Date
        </label>
        <input id="ad-day" name="day" type="date" max={today} defaultValue={start.day} className={`${inputClass} ${fieldBorder("day")}`} />
        {note("day")}
      </div>
      <div>
        <label htmlFor="ad-product" className="block text-sm font-medium text-body">
          Product
        </label>
        <select id="ad-product" name="productId" defaultValue={start.productId} className={`${inputClass} ${fieldBorder("productId")}`}>
          <option value="">Choose a product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
        {note("productId")}
      </div>
      <TextField
        name="amountUsd"
        label="Amount (USD)"
        defaultValue={start.amountUsd}
        error={errors.amountUsd}
        hint="What Meta billed for this product on this day."
        placeholder="12.50"
        numeric="decimal"
        onChange={setUsd}
      />
      <TextField
        name="usdRate"
        label="Dollar rate (taka per USD)"
        defaultValue={start.usdRate}
        error={errors.usdRate}
        hint={edit ? "The rate saved with this entry." : "Starts with the rate from Settings."}
        numeric="decimal"
        onChange={setRate}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-brand-light px-4 py-3 sm:col-span-2">
        <p className="text-sm font-medium text-body">
          Amount in taka: <span className="text-lg font-bold text-heading">{bdt === null ? "-" : <Money amount={bdt} bold />}</span>
        </p>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-6 py-2 font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving..." : edit ? "Save changes" : "Add ad spend"}
        </button>
      </div>
    </form>
  );
}
