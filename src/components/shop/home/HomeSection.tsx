import type { ReactNode } from "react";

export function HomeSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-lg font-bold text-heading sm:text-xl">{title}</h2>
      {children}
    </section>
  );
}
