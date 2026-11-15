import type { Types } from "mongoose";

// One product line of an order, a snapshot from the moment it was placed. The first line is the product the order was placed from.
export interface OrderItem {
  productId: Types.ObjectId;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  quantity: number;
}

// Orders placed before multi-item orders keep their one product and its quantity at the top level.
interface ItemFields<T> {
  items?: (T & { quantity: number })[];
  product?: T;
  quantity?: number;
}

export function orderItems<T>(doc: ItemFields<T>): (T & { quantity: number })[] {
  if (doc.items && doc.items.length > 0) return doc.items;
  return doc.product ? [{ ...doc.product, quantity: doc.quantity ?? 1 }] : [];
}

export function totalUnits(items: { quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

// "Name x 2, Other x 1" for lists, cards and the courier note.
export function itemsLabel(items: { name: string; quantity: number }[]): string {
  return items.map((item) => `${item.name} x ${item.quantity}`).join(", ");
}

// Projection for each line's product, name and quantity, on new and old orders.
export const ITEM_LINES_PROJECTION = {
  "items.productId": 1,
  "items.name": 1,
  "items.quantity": 1,
  "product.productId": 1,
  "product.name": 1,
  quantity: 1,
} as const;

export type ItemLine = Pick<OrderItem, "productId" | "name" | "quantity">;
export type ItemLinesDoc = ItemFields<Pick<OrderItem, "productId" | "name">>;

// Orders that have this product on any line.
export function withProduct(productId: Types.ObjectId | string) {
  return { $or: [{ "items.productId": productId }, { "product.productId": productId }] };
}

// Aggregation stage that gives old orders an `items` array too.
export const ITEMS_STAGE = {
  $addFields: {
    items: {
      $cond: [
        { $gt: [{ $size: { $ifNull: ["$items", []] } }, 0] },
        "$items",
        [{ productId: "$product.productId", name: "$product.name", price: "$product.price", quantity: "$quantity" }],
      ],
    },
  },
};

// One document per order line; `line` is 0 on the product the order was placed from.
export const UNWIND_ITEMS = [ITEMS_STAGE, { $unwind: { path: "$items", includeArrayIndex: "line" } }];

export const IS_MAIN_LINE = { $eq: ["$line", 0] };

export const LINE_SUBTOTAL = { $multiply: ["$items.price", "$items.quantity"] };

// A line's part of an order-level amount: other lines take their own subtotal, the main line takes the rest,
// so the lines of one order always add up to the amount (and a one-line order keeps all of it).
export function lineShare(amount: string) {
  return { $cond: [IS_MAIN_LINE, { $subtract: [amount, { $subtract: ["$subtotal", LINE_SUBTOTAL] }] }, LINE_SUBTOTAL] };
}
