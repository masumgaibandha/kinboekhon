import type { ReactNode } from "react";

import { clearPathaoSend, sendToPathao } from "@/app/admin/(panel)/orders/pathao-actions";
import { OrderCard } from "@/components/admin/orders/OrderCard";
import { PathaoActionButton } from "@/components/admin/pathao/PathaoActionButton";
import { PathaoLocationForm } from "@/components/admin/pathao/PathaoLocationForm";
import { PathaoShipment } from "@/components/admin/pathao/PathaoShipment";
import { Money } from "@/components/ui/Money";
import type { AdminOrder } from "@/lib/orders/admin-order-detail";
import { getPathaoFormData } from "@/lib/pathao/card-data";
import { sendIsUnclear } from "@/lib/pathao/clear-send";
import { NOT_CONNECTED } from "@/lib/pathao/config";

const idOf = (place: { id: number } | null) => (place ? String(place.id) : "");

function Note({ children }: { children: ReactNode }) {
  return <p className="rounded-lg bg-brand-light px-3 py-2 text-sm text-brand-dark">{children}</p>;
}

async function PathaoBody({ order, formKey }: { order: AdminOrder; formKey: string }) {
  const { courier } = order;
  if (courier?.state === "sent" && courier.consignmentId) {
    return <PathaoShipment orderNumber={order.orderNumber} courier={{ ...courier, consignmentId: courier.consignmentId }} location={order.courierLocation} />;
  }
  if (courier && sendIsUnclear(courier)) {
    return (
      <div className="space-y-3">
        <Note>
          No clear answer from Pathao{courier.error ? ` (${courier.error})` : ""}. Look for {order.orderNumber} in the Pathao panel. If it is
          not there, clear this send and send again.
        </Note>
        <PathaoActionButton orderNumber={order.orderNumber} action={clearPathaoSend} label="Not in Pathao: clear" pendingLabel="Clearing..." toastId="pathao-clear" secondary />
      </div>
    );
  }
  if (courier) return <p className="text-sm text-desc">Sending to Pathao. Reload the page in a moment.</p>;
  if (order.status !== "pending" && order.status !== "confirmed") return <p className="text-sm text-desc">Not sent to Pathao.</p>;

  const data = await getPathaoFormData(order);
  if (!data) return <p className="text-sm text-desc">{NOT_CONNECTED}</p>;
  const { guess } = data;
  return (
    <div className="space-y-4">
      <PathaoLocationForm
        key={formKey}
        orderNumber={order.orderNumber}
        cities={data.cities}
        zones={data.zones}
        areas={data.areas}
        initial={{ cityId: idOf(guess.city), zoneId: idOf(guess.zone), areaId: idOf(guess.area) }}
        citySource={guess.citySource}
        zoneSource={guess.zoneSource}
      />
      <p className="text-sm text-desc">
        Weight {data.weightKg} kg. Collect <Money amount={data.amountToCollect} /> on delivery.
      </p>
      {order.status === "confirmed" ? (
        <PathaoActionButton orderNumber={order.orderNumber} action={sendToPathao} label="Send to Pathao" pendingLabel="Sending..." toastId="pathao-send" />
      ) : (
        <p className="text-sm text-muted">Confirm the order to send it to Pathao.</p>
      )}
    </div>
  );
}

export function PathaoCard({ order, formKey }: { order: AdminOrder; formKey: string }) {
  return (
    <OrderCard title="Pathao courier">
      <PathaoBody order={order} formKey={formKey} />
    </OrderCard>
  );
}
