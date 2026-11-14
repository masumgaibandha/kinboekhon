import type { ReactNode } from "react";

const UPDATED = "14 নভেম্বর 2026";

export function PolicyPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <article className="mx-auto w-full max-w-xl px-4 py-6">
      <div className="rounded-xl border border-line bg-card p-5">
        <h1 className="text-2xl font-bold text-heading">{title}</h1>
        <p className="mt-1 text-xs text-muted">সর্বশেষ হালনাগাদ: {UPDATED}</p>
        <p className="mt-4 text-[15px] leading-relaxed text-desc">{intro}</p>
        <div className="mt-2 space-y-5">{children}</div>
      </div>
    </article>
  );
}

export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="mt-4 text-lg font-bold text-heading">{title}</h2>
      {children}
    </section>
  );
}

export function PolicyList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-body marker:text-brand">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function PolicyText({ children }: { children: ReactNode }) {
  return <p className="text-[15px] leading-relaxed text-body">{children}</p>;
}
