import { connectMongoose } from "@/lib/db";
import { OrderModel, type OrderDocument } from "@/lib/models/Order";
import { recordStockMove } from "@/lib/stock/record-move";

type StockOrder = Pick<OrderDocument, "orderNumber" | "status" | "quantity" | "product" | "returnReason" | "stockOut" | "stockBack">;

const PROJECTION = { orderNumber: 1, status: 1, quantity: 1, product: 1, returnReason: 1, stockOut: 1, stockBack: 1 };

// A stock problem is logged and never fails the status change that called it.
async function safely(orderNumber: string, work: () => Promise<void>) {
  try {
    await connectMongoose();
    await work();
  } catch (error) {
    console.error(`Stock update failed for ${orderNumber}`, error);
  }
}

// Called after an order became Shipped: takes its units out of stock once.
export function takeOrderStock(orderNumber: string): Promise<void> {
  return safely(orderNumber, async () => {
    const order = await OrderModel.findOne({ orderNumber }, PROJECTION).lean<StockOrder>();
    if (!order || order.status !== "shipped" || order.stockOut !== undefined) return;
    const marked = await OrderModel.updateOne({ orderNumber, stockOut: { $exists: false } }, { $set: { stockOut: order.quantity } });
    if (marked.modifiedCount === 0) return;
    await recordStockMove(order.product.productId, "shipped", -order.quantity, { orderNumber, note: "Sent to the courier" });
  });
}

// Called after an order became Returned or its return reason changed. A returned parcel goes back in stock
// unless its reason is Damaged; orders shipped before stock tracking never took stock, so they put nothing back.
export function syncReturnedStock(orderNumber: string): Promise<void> {
  return safely(orderNumber, async () => {
    const order = await OrderModel.findOne({ orderNumber }, PROJECTION).lean<StockOrder>();
    if (!order || order.status !== "returned" || !order.stockOut) return;
    const damaged = order.returnReason === "damaged";
    const { productId } = order.product;

    if (!damaged && order.stockBack === undefined) {
      const marked = await OrderModel.updateOne({ orderNumber, stockBack: { $exists: false } }, { $set: { stockBack: order.stockOut } });
      if (marked.modifiedCount > 0) await recordStockMove(productId, "returned", order.stockOut, { orderNumber, note: "Parcel returned" });
    } else if (damaged && order.stockBack !== undefined) {
      const marked = await OrderModel.updateOne({ orderNumber, stockBack: order.stockBack }, { $unset: { stockBack: "" } });
      if (marked.modifiedCount > 0) await recordStockMove(productId, "damaged", -order.stockBack, { orderNumber, note: "Return marked damaged" });
    }
  });
}
