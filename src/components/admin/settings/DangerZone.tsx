"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import toast from "react-hot-toast";

import { resetTestData } from "@/app/admin/(panel)/settings/reset-actions";
import { inputClass } from "@/components/admin/form/fields";
import { TEST_DATA_LABELS, type TestDataCounts } from "@/lib/reset/test-data-labels";
import { RESET_PHRASE } from "@/lib/validation/reset";

export function DangerZone({ counts }: { counts: TestDataCounts }) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await resetTestData(formData);
      if (result.ok) {
        setErrors({});
        form.reset();
        toast.success(result.message);
        router.refresh();
      } else {
        setErrors(result.fieldErrors);
        toast.error(result.message, { id: "reset-error" });
      }
    });
  }

  const field = (name: "confirm" | "password", label: string, type: string) => (
    <div>
      <label htmlFor={`reset-${name}`} className="block text-sm font-medium text-body">
        {label}
      </label>
      <input
        id={`reset-${name}`}
        name={name}
        type={type}
        autoComplete={type === "password" ? "current-password" : "off"}
        aria-invalid={errors[name] ? true : undefined}
        className={`${inputClass} ${errors[name] ? "border-brand-dark" : "border-line-strong"}`}
      />
      {errors[name] && <p className="mt-1 text-sm text-brand-dark">{errors[name]}</p>}
    </div>
  );

  return (
    <section className="rounded-xl border-2 border-brand-dark bg-card p-5">
      <h2 className="text-lg font-semibold text-brand-dark">Danger zone</h2>
      <p className="mt-1 text-sm text-desc">
        Before launch only. Deletes all orders (with their calls and payments), incomplete orders, customers, fraud
        checks, ad spend entries and stock moves, sets the stock of every product to 0, and the next order becomes KE10001.
        Products, categories, banners, landing pages, settings and the admin login are kept.
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(Object.keys(TEST_DATA_LABELS) as (keyof TestDataCounts)[]).map((key) => (
          <div key={key} className="rounded-lg border border-line bg-page px-3 py-2">
            <dt className="text-xs text-muted">{TEST_DATA_LABELS[key]}</dt>
            <dd className="text-lg font-semibold text-heading">{counts[key].toLocaleString("en-US")}</dd>
          </div>
        ))}
      </dl>
      <form onSubmit={handleSubmit} noValidate className="mt-4 grid gap-4 sm:grid-cols-2">
        {field("confirm", `Type ${RESET_PHRASE}`, "text")}
        {field("password", "Admin password", "password")}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-brand-dark py-3 font-semibold text-white disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {pending ? "Deleting..." : "Delete all test data"}
          </button>
        </div>
      </form>
    </section>
  );
}
