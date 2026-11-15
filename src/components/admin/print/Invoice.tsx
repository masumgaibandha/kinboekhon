import Image from "next/image";
import type { ReactNode } from "react";

import { Money } from "@/components/ui/Money";
import type { InvoiceOrder } from "@/lib/orders/invoice";

export interface InvoiceContact {
  supportPhone: string;
  whatsappNumber: string;
}

function Row({ label, children, strong }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 py-0.5 ${strong ? "font-bold text-heading" : ""}`}>
      <dt>{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

// One A5 page in Bangla. Numbers stay in English digits.
export function Invoice({ order, contact }: { order: InvoiceOrder; contact: InvoiceContact }) {
  return (
    <article className="invoice-page mx-auto flex w-[148mm] flex-col bg-card p-[8mm] text-[11pt] leading-snug text-body">
      <header className="flex items-start justify-between gap-4 border-b-2 border-brand pb-3">
        <div>
          <Image src="/brand/logo-horizontal.svg" alt="কিনবো এখন" width={604} height={120} className="h-9 w-auto" />
          <p className="mt-1 text-[9pt] text-desc">দরকার যখন, কিনবো এখন · www.kinboekhon.com</p>
        </div>
        <div className="text-right">
          <p className="text-[14pt] font-bold text-heading">ইনভয়েস</p>
          <p className="font-semibold text-heading">{order.orderNumber}</p>
          <p className="text-[9pt] text-desc">তারিখ: {order.date}</p>
        </div>
      </header>

      <section className="mt-3">
        <p className="text-[9pt] font-semibold text-muted">গ্রাহক</p>
        <p className="font-semibold text-heading">{order.name}</p>
        <p>মোবাইল: {order.phone}</p>
        <p>
          ঠিকানা: {order.address}, {order.place}
        </p>
      </section>

      <table className="mt-4 w-full text-left">
        <thead className="border-y border-line-strong text-[9pt] text-desc">
          <tr>
            <th className="py-1 font-semibold">পণ্য</th>
            <th className="py-1 text-right font-semibold">পরিমাণ</th>
            <th className="py-1 text-right font-semibold">দাম</th>
            <th className="py-1 text-right font-semibold">মোট</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={index} className="border-b border-line">
              <td className="py-1.5 pr-2">{item.name}</td>
              <td className="py-1.5 text-right">{item.quantity}</td>
              <td className="py-1.5 text-right">
                <Money amount={item.price} />
              </td>
              <td className="py-1.5 text-right">
                <Money amount={item.price * item.quantity} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="mt-3 ml-auto w-[70%]">
        <Row label="পণ্যের দাম">
          <Money amount={order.subtotal} />
        </Row>
        <Row label="ডেলিভারি চার্জ">
          <Money amount={order.deliveryCharge} />
        </Row>
        {order.discount > 0 && (
          <Row label="ছাড়">
            -<Money amount={order.discount} />
          </Row>
        )}
        <div className="mt-1 border-t border-line-strong pt-1">
          <Row label="সর্বমোট" strong>
            <Money amount={order.total} bold />
          </Row>
        </div>
        <Row label="অগ্রিম পরিশোধ">
          {order.paidInAdvance > 0 && "-"}
          <Money amount={order.paidInAdvance} />
        </Row>
        <div className="mt-1 rounded border-2 border-brand px-2 py-1 text-[13pt]">
          <Row label="ডেলিভারির সময় দেবেন" strong>
            <Money amount={order.toCollect} bold />
          </Row>
        </div>
      </dl>

      <footer className="mt-auto border-t border-line-strong pt-2 text-[9pt] text-desc">
        <p>
          ফেরত নীতি: নষ্ট, ভুল বা ত্রুটিপূর্ণ পণ্য পেলে ডেলিভারির 3 দিনের মধ্যে ছবি বা ভিডিওসহ জানান। বিস্তারিত:
          www.kinboekhon.com/return-policy
        </p>
        {(contact.supportPhone || contact.whatsappNumber) && (
          <p className="mt-1 font-semibold text-body">
            যোগাযোগ:
            {contact.supportPhone && ` ফোন ${contact.supportPhone}`}
            {contact.supportPhone && contact.whatsappNumber && ","}
            {contact.whatsappNumber && ` WhatsApp ${contact.whatsappNumber}`}
          </p>
        )}
        <p className="mt-1">কিনবো এখন থেকে কেনাকাটার জন্য ধন্যবাদ।</p>
      </footer>
    </article>
  );
}
