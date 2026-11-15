import type { ReactNode } from "react";

import { refreshPathao } from "@/app/admin/(panel)/orders/pathao-actions";
import { PathaoActionButton } from "@/components/admin/pathao/PathaoActionButton";
import { Money } from "@/components/ui/Money";
import { formatDhakaDateTime } from "@/lib/dates";
import type { OrderCourier } from "@/lib/models/Order";
import { trackingUrl } from "@/lib/pathao/config";
import type { CourierLocation } from "@/lib/pathao/location-match";
import { courierStatusLabel } from "@/lib/pathao/status-map";

interface PathaoShipmentProps {
  orderNumber: string;
  courier: OrderCourier & { consignmentId: string };
  location: CourierLocation | null;
}

// A parcel Pathao took: consignment with its tracking link, Pathao's fee and status.
export function PathaoShipment({ orderNumber, courier, location }: PathaoShipmentProps) {
  const rows: [string, ReactNode][] = [
    [
      "Consignment",
      <a key="c" href={trackingUrl(courier.consignmentId)} target="_blank" rel="noreferrer" className="font-semibold text-brand hover:underline">
        {courier.consignmentId}
      </a>,
    ],
    ["Delivery fee", courier.deliveryFee === undefined ? "-" : <Money key="f" amount={courier.deliveryFee} />],
    ["Pathao status", courier.status ? courierStatusLabel(courier.status) : "-"],
    ["Updated", courier.statusAt ? formatDhakaDateTime(courier.statusAt) : "-"],
    ["Sent to", location ? [location.areaName, location.zoneName, location.cityName].filter(Boolean).join(", ") : "-"],
  ];

  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted">{label}</dt>
            <dd className="text-body">{value}</dd>
          </div>
        ))}
      </dl>
      <PathaoActionButton
        orderNumber={orderNumber}
        action={refreshPathao}
        label="Refresh status"
        pendingLabel="Refreshing..."
        toastId="pathao-refresh"
        secondary
      />
    </div>
  );
}
