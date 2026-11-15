import { connectMongoose } from "@/lib/db";
import { OrderModel, type OrderDocument } from "@/lib/models/Order";
import { orderItems, totalUnits } from "@/lib/orders/order-items";
import { recordStockMove } from "@/lib/stock/record-move";

type StockOrder = Pick<OrderDocument, "orderNumber" | "status" | "items" | "quantity" | "product" | "returnReason" | "stockOut" | "stockBack">;

const PROJECTION = { orderNumber: 1, status: 1, items: 1, quantity: 1, product: 1, returnReason: 1, stockOut: 1, stockBack: 1 };

// A stock problem is logged and never fails the status change that called it.
async function safely(orderNumber: string, work: () => Promise<void>) {
  try {
    await connectMongoose();
    await work();
  } catch (error) {
    console.error(`Stock update failed for ${orderNumber}`, error);
  }
}

// One logged move per order line, each with its own product and quantity (sign: +1 in, -1 out).
async function moveLines(order: StockOrder, kind: "shipped" | "returned" | "damaged", sign: 1 | -1, note: string) {
  for (const item of orderItems(order)) {
    await recordStockMove(item.productId, kind, sign * item.quantity, { orderNumber: order.orderNumber, note });
  }
}

// Called after an order became Shipped: takes its units out of stock once. stockOut keeps the units of all lines.
export function takeOrderStock(orderNumber: string): Promise<void> {
  return safely(orderNumber, async () => {
    const order = await OrderModel.findOne({ orderNumber }, PROJECTION).lean<StockOrder>();
    if (!order || order.status !== "shipped" || order.stockOut !== undefined) return;
    const units = totalUnits(orderItems(order));
    const marked = await OrderModel.updateOne({ orderNumber, stockOut: { $exists: false } }, { $set: { stockOut: units } });
    if (marked.modifiedCount === 0) return;
    await moveLines(order, "shipped", -1, "Sent to the courier");
  });
}

// Called after an order became Returned or its return reason changed. A returned parcel goes back in stock
// unless its reason is Damaged; orders shipped before stock tracking never took stock, so they put nothing back.
export function syncReturnedStock(orderNumber: string): Promise<void> {
  return safely(orderNumber, async () => {
    const order = await OrderModel.findOne({ orderNumber }, PROJECTION).lean<StockOrder>();
    if (!order || order.status !== "returned" || !order.stockOut) return;
    const damaged = order.returnReason === "damaged";

    if (!damaged && order.stockBack === undefined) {
      const marked = await OrderModel.updateOne({ orderNumber, stockBack: { $exists: false } }, { $set: { stockBack: order.stockOut } });
      if (marked.modifiedCount > 0) await moveLines(order, "returned", 1, "Parcel returned");
    } else if (damaged && order.stockBack !== undefined) {
      const marked = await OrderModel.updateOne({ orderNumber, stockBack: order.stockBack }, { $unset: { stockBack: "" } });
      if (marked.modifiedCount > 0) await moveLines(order, "damaged", -1, "Return marked damaged");
    }
  });
}
