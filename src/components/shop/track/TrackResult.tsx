import { TruckIcon, WhatsAppIcon } from "@/components/shop/icons";
import { TrackTimeline } from "@/components/shop/track/TrackTimeline";
import { Money } from "@/components/ui/Money";
import { formatBanglaDateTime } from "@/lib/bangla-date";
import type { TrackedOrder } from "@/lib/orders/order-status";
import { toInternationalPhone } from "@/lib/phone";

const SHIPPED: TrackedOrder["status"][] = ["shipped", "delivered", "returned"];

export function TrackResult({ order, whatsappNumber }: { order: TrackedOrder; whatsappNumber: string }) {
  const cancelledAt = order.reachedAt.cancelled;
  const chat = `https://wa.me/${toInternationalPhone(whatsappNumber)}?text=${encodeURIComponent(`অর্ডার নম্বর ${order.orderNumber}`)}`;

  return (
    <section aria-live="polite" className="mt-4 space-y-5 rounded-xl border border-line bg-card px-5 py-5">
      <div>
        <p className="text-sm text-desc">অর্ডার নম্বর</p>
        <p className="text-2xl font-bold tracking-wide text-brand">{order.orderNumber}</p>
        <p className="mt-1 text-sm text-desc">অর্ডার করেছেন {formatBanglaDateTime(order.placedAt)}</p>
        <ul className="mt-3 space-y-1 border-t border-dashed border-line-strong pt-3 text-[15px] text-body">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between gap-3">
              <span>{item.name}</span>
              <span className="whitespace-nowrap text-desc">× {item.quantity}</span>
            </li>
          ))}
          <li className="flex justify-between gap-3 pt-1 font-bold">
            <span>মোট</span>
            <Money amount={order.total} bold />
          </li>
        </ul>
      </div>

      {order.status === "cancelled" && (
        <p className="rounded-md bg-brand-light px-3 py-2 font-semibold text-brand-dark">
          অর্ডারটি বাতিল হয়েছে{cancelledAt && `, ${formatBanglaDateTime(cancelledAt)}`}
        </p>
      )}

      <TrackTimeline order={order} />

      {order.trackingUrl && SHIPPED.includes(order.status) && (
        <a
          href={order.trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-md bg-brand py-3 font-bold text-white transition-colors hover:bg-brand-dark"
        >
          <TruckIcon className="size-5" />
          কুরিয়ারে পার্সেল ট্র্যাক করুন
        </a>
      )}

      {whatsappNumber && (
        <a
          href={chat}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-md border border-brand py-3 font-bold text-brand transition-colors hover:bg-brand-light"
        >
          <WhatsAppIcon className="size-5" />
          WhatsApp এ যোগাযোগ করুন
        </a>
      )}
    </section>
  );
}
