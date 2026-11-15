"use client";

import { useState } from "react";

import { MAX_FAQ, type HomeContentValues } from "@/lib/validation/home-content";

type Faq = HomeContentValues["faq"][number];

const inputClass =
  "w-full rounded-lg border border-line-strong bg-card px-3 py-2 text-body outline-none focus:border-brand";

let nextKey = 0;
const withKey = (faq: Faq) => ({ ...faq, key: nextKey++ });

export function FaqRows({ faq, errors }: { faq: Faq[]; errors: Record<string, string> }) {
  const [rows, setRows] = useState(() => faq.map(withKey));

  return (
    <div className="space-y-3 sm:col-span-2">
      {rows.length === 0 && <p className="text-sm text-muted">No questions. The FAQ section is hidden.</p>}
      {rows.map((row, index) => {
        const error = errors[`faq.${index}.question`] ?? errors[`faq.${index}.answer`];
        return (
          <div key={row.key} className="space-y-2 rounded-lg border border-line p-3">
            <div className="flex gap-2">
              <input
                name="faq.question"
                defaultValue={row.question}
                placeholder="Question (Bangla)"
                aria-label={`Question ${index + 1}`}
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
            <textarea
              name="faq.answer"
              defaultValue={row.answer}
              rows={2}
              placeholder="Answer (Bangla)"
              aria-label={`Answer ${index + 1}`}
              className={inputClass}
            />
            {error && <p className="text-sm text-brand-dark">{error}</p>}
          </div>
        );
      })}
      {errors.faq && <p className="text-sm text-brand-dark">{errors.faq}</p>}
      <button
        type="button"
        onClick={() => setRows((current) => [...current, withKey({ question: "", answer: "" })])}
        disabled={rows.length >= MAX_FAQ}
        className="rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-light disabled:opacity-60"
      >
        Add question
      </button>
    </div>
  );
}
