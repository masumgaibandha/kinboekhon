import { labelClass } from "@/components/shop/order/OrderField";
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
    <div>
      <p className={labelClass}>এটাও নিন</p>
      <ul className="space-y-2">
        {products.map((product) => {
          const quantity = added[product.id] ?? 0;
          return (
            <li
              key={product.id}
              className={`flex items-center gap-3 rounded-md border p-2 ${quantity > 0 ? "border-brand bg-brand-light" : "border-line-strong bg-card"}`}
            >
              <div className="relative size-14 shrink-0 overflow-hidden rounded bg-page">
                {product.image && (
                  <CloudinaryImage publicId={product.image.publicId} alt={product.name} fill sizes="56px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-heading">{product.name}</p>
                <p className="mt-0.5 text-[15px] font-bold text-brand">
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
                  className="shrink-0 rounded-md border border-brand bg-card px-3 py-2 text-sm font-bold text-brand transition-colors hover:bg-brand-light"
                >
                  + যোগ করুন
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
