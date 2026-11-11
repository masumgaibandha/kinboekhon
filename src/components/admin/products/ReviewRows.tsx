"use client";

import { useState } from "react";

import type { ProductInput } from "@/lib/validation/product";

type Review = ProductInput["proof"]["reviews"][number];

interface ReviewRowsProps {
  reviews: Review[];
  errors: Record<string, string>;
}

const inputClass =
  "w-full rounded-lg border border-line-strong bg-card px-3 py-2 text-body outline-none focus:border-brand";

let nextKey = 0;
const withKey = (review: Review) => ({ ...review, key: nextKey++ });

export function ReviewRows({ reviews, errors }: ReviewRowsProps) {
  const [rows, setRows] = useState(() => reviews.map(withKey));

  return (
    <div className="space-y-3 sm:col-span-2">
      <p className="text-sm font-medium text-body">Reviews</p>
      {rows.map((row, index) => {
        const error = errors[`proof.reviews.${index}.text`] ?? errors[`proof.reviews.${index}.name`];
        return (
          <div key={row.key} className="rounded-lg border border-line p-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
              <input
                name="reviews.name"
                defaultValue={row.name}
                placeholder="Customer name"
                aria-label={`Review ${index + 1} customer name`}
                className={inputClass}
              />
              <input
                name="reviews.text"
                defaultValue={row.text}
                placeholder="Review text"
                aria-label={`Review ${index + 1} text`}
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
      {errors["proof.reviews"] && <p className="text-sm text-brand-dark">{errors["proof.reviews"]}</p>}
      <button
        type="button"
        onClick={() => setRows((current) => [...current, withKey({ name: "", text: "" })])}
        className="rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-light"
      >
        Add review
      </button>
    </div>
  );
}
