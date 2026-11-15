import { labelClass } from "@/components/shop/order/OrderField";
import { QuantityStepper } from "@/components/shop/order/QuantityStepper";
import { UpsellPicker } from "@/components/shop/order/UpsellPicker";
import type { ProductCardData } from "@/lib/catalog";

interface OrderBasketProps {
  quantity: number;
  onQuantity: (quantity: number) => void;
  upsells: ProductCardData[];
  added: Record<string, number>;
  onAdded: (productId: string, quantity: number) => void;
}

// The product's quantity and the "এটাও নিন" products.
export function OrderBasket({ quantity, onQuantity, upsells, added, onAdded }: OrderBasketProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className={labelClass}>পরিমাণ</p>
        <QuantityStepper value={quantity} onChange={onQuantity} />
      </div>
      <UpsellPicker products={upsells} added={added} onChange={onAdded} />
    </div>
  );
}
