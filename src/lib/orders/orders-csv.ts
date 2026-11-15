import type { CsvCell } from "@/lib/csv";
import { toCsv } from "@/lib/csv";
import { connectMongoose } from "@/lib/db";
import { formatDhakaDateTime } from "@/lib/dates";
import { formatLocation } from "@/lib/locations/format";
import { OrderModel, type OrderDocument } from "@/lib/models/Order";
import { CALL_OUTCOME_LABELS } from "@/lib/orders/call-labels";
import { orderListQuery } from "@/lib/orders/order-query";
import { METHOD_LABELS, OPTION_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/orders/payment-methods";
import { RETURN_REASON_LABELS } from "@/lib/orders/return-reason-labels";
import { STATUS_LABELS } from "@/lib/orders/status";
import { amountToCollect } from "@/lib/pathao/parcel";
import type { OrderFilters } from "@/lib/validation/order-filters";

export const EXPORT_LIMIT = 5000;

const HEADER = [
  "Order number",
  "Placed (Dhaka)",
  "Status",
  "Customer",
  "Phone",
  "Address",
  "Area",
  "Product",
  "Quantity",
  "Unit price",
  "Subtotal",
  "Delivery charge",
  "Discount",
  "Total",
  "Payment option",
  "Payment method",
  "Payment status",
  "Paid in advance",
  "To collect",
  "Consignment",
  "Latest call",
  "Return reason",
  "Admin note",
];

function row(order: OrderDocument): CsvCell[] {
  const paid = order.payment.status === "verified" ? order.payment.advanceAmount : 0;
  return [
    order.orderNumber,
    formatDhakaDateTime(order.createdAt),
    STATUS_LABELS[order.status],
    order.customer.name,
    { excelText: order.customer.phone },
    order.customer.address,
    formatLocation(order.customer.location),
    order.product.name,
    order.quantity,
    order.product.price,
    order.subtotal,
    order.deliveryCharge ?? 0,
    order.discount,
    order.total,
    OPTION_LABELS[order.payment.option],
    METHOD_LABELS[order.payment.method],
    PAYMENT_STATUS_LABELS[order.payment.status],
    paid,
    amountToCollect(order),
    order.courier?.consignmentId ?? "",
    order.lastCall?.outcome ? CALL_OUTCOME_LABELS[order.lastCall.outcome] : "",
    order.returnReason ? RETURN_REASON_LABELS[order.returnReason] : "",
    order.adminNote,
  ];
}

// Orders matching the list filters, newest first, as CSV text.
export async function ordersCsv(filters: OrderFilters): Promise<string> {
  await connectMongoose();
  const orders = await OrderModel.find(await orderListQuery(filters), { statusHistory: 0, tracking: 0 })
    .sort({ createdAt: -1 })
    .limit(EXPORT_LIMIT)
    .lean<OrderDocument[]>();
  return toCsv(HEADER, orders.map(row));
}
