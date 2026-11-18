import { cardClass } from "@/components/shop/order/OrderStep";
import { QuantityStepper } from "@/components/shop/order/QuantityStepper";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { Money } from "@/components/ui/Money";
import type { ProductCardData } from "@/lib/catalog";

interface UpsellPickerProps {
  products: ProductCardData[];
  // Quantity per added product id; a product not in it is not on the order.
  added: Record<string, number>;
  onChange: (productId: string, quantity: number) => void;
}

// "এটাও নিন": one tap adds a product to the same order and the same delivery charge.
export function UpsellPicker({ products, added, onChange }: UpsellPickerProps) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="order-upsell" className={cardClass}>
      <h3 id="order-upsell" className="mb-3 text-[17px] font-bold text-heading">
        এটাও নিন
      </h3>
      <ul className="space-y-2">
        {products.map((product) => {
          const quantity = added[product.id] ?? 0;
          return (
            <li
              key={product.id}
              className={`flex items-center gap-3 rounded-xl border p-2 ${quantity > 0 ? "border-brand bg-brand-light" : "border-line bg-card"}`}
            >
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-page">
                {product.image && (
                  <CloudinaryImage publicId={product.image.publicId} alt={product.name} fill sizes="48px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-heading">{product.name}</p>
                <p className="mt-0.5 text-sm font-bold text-brand">
                  <Money amount={product.price} bold />
                </p>
              </div>
              {quantity > 0 ? (
                <QuantityStepper value={quantity} onChange={(next) => onChange(product.id, next)} min={0} compact />
              ) : (
                <button
                  type="button"
                  onClick={() => onChange(product.id, 1)}
                  aria-label={`${product.name} যোগ করুন`}
                  className="h-9 shrink-0 rounded-lg border border-brand bg-card px-3 text-sm font-bold text-brand transition-colors hover:bg-brand-light"
                >
                  + যোগ করুন
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
