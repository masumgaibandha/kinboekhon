import type { ReactNode } from "react";

interface OrderCardProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export function OrderCard({ title, action, children }: OrderCardProps) {
  return (
    <section className="rounded-xl border border-line bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-heading">{title}</h2>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}
