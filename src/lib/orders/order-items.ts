import type { Types } from "mongoose";

// One product line of an order, a snapshot from the moment it was placed.
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
