"use client";

import { useState } from "react";

import { BENEFIT_ICONS, MAX_BENEFITS, type BenefitIcon } from "@/lib/landing/benefit-icons";
import type { LandingValues } from "@/lib/validation/landing";

type Benefit = LandingValues["benefits"]["items"][number];

const inputClass =
  "w-full rounded-lg border border-line-strong bg-card px-3 py-2 text-body outline-none focus:border-brand";

let nextKey = 0;
const withKey = (benefit: Benefit) => ({ ...benefit, key: nextKey++ });

export function BenefitRows({ items, errors }: { items: Benefit[]; errors: Record<string, string> }) {
  const [rows, setRows] = useState(() => items.map(withKey));

  return (
    <div className="space-y-3 sm:col-span-2">
      <p className="text-sm font-medium text-body">Benefits</p>
      {rows.map((row, index) => {
        const error = errors[`benefits.items.${index}.text`] ?? errors[`benefits.items.${index}.icon`];
        return (
          <div key={row.key}>
            <div className="grid gap-2 sm:grid-cols-[14rem_1fr_auto]">
              <select name="benefits.icon" defaultValue={row.icon} aria-label={`Benefit ${index + 1} icon`} className={inputClass}>
                {(Object.keys(BENEFIT_ICONS) as BenefitIcon[]).map((icon) => (
                  <option key={icon} value={icon}>
                    {BENEFIT_ICONS[icon]}
                  </option>
                ))}
              </select>
              <input
                name="benefits.text"
                defaultValue={row.text}
                placeholder="Benefit (Bangla)"
                aria-label={`Benefit ${index + 1} text`}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}
                className="rounded-lg border border-line-strong px-3 py-2 text-sm text-desc hover:text-brand"
              >
                Remove
              </button>
            </div>
            {error && <p className="mt-1 text-sm text-brand-dark">{error}</p>}
          </div>
        );
      })}
      {errors["benefits.items"] && <p className="text-sm text-brand-dark">{errors["benefits.items"]}</p>}
      <button
        type="button"
        onClick={() => setRows((current) => [...current, withKey({ icon: "check", text: "" })])}
        disabled={rows.length >= MAX_BENEFITS}
        className="rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-light disabled:opacity-60"
      >
        Add benefit
      </button>
    </div>
  );
}
