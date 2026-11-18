import type { ReactNode } from "react";

interface OrderStepProps {
  number: number;
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

export const cardClass = "rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-6";

// One numbered part of the order form, in its own card.
export function OrderStep({ number, title, icon, children }: OrderStepProps) {
  return (
    <section aria-labelledby={`order-step-${number}`} className={cardClass}>
      <h3 id={`order-step-${number}`} className="mb-4 flex items-center gap-3 text-[17px] font-bold text-heading">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">{icon}</span>
        <span>
          {number}. {title}
        </span>
      </h3>
      {children}
    </section>
  );
}
