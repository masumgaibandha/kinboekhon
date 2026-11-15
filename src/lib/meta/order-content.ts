export interface ContentLine {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

// Purchase data for every line of an order, the same in the browser Pixel and the Conversions API.
// The value is the product total of all lines: no delivery charge, no discount.
export function orderContent(lines: ContentLine[]) {
  return {
    content_ids: lines.map((line) => line.productId),
    content_name: lines.map((line) => line.name).join(", "),
    content_type: "product" as const,
    contents: lines.map((line) => ({ id: line.productId, quantity: line.quantity, item_price: line.price })),
    currency: "BDT" as const,
    value: lines.reduce((sum, line) => sum + line.price * line.quantity, 0),
    num_items: lines.reduce((sum, line) => sum + line.quantity, 0),
  };
}
