import type { ReactNode } from "react";

interface CheckoutAsideProps {
  product: ReactNode;
  summary: ReactNode;
  // The order button and the lines under it.
  children: ReactNode;
}

// From 1024px the sticky summary card on the right. Below that it adds no box, so the order button can be the form's last item.
export function CheckoutAside({ product, summary, children }: CheckoutAsideProps) {
  return (
    <aside className="contents lg:sticky lg:top-20 lg:block lg:space-y-4 lg:rounded-2xl lg:border lg:border-line lg:bg-card lg:p-6 lg:shadow-sm">
      <div className="hidden space-y-4 lg:block">
        <h3 className="text-[17px] font-bold text-heading">অর্ডারের সারাংশ</h3>
        {product}
        <div className="border-t border-line pt-4">{summary}</div>
      </div>
      {children}
    </aside>
  );
}
