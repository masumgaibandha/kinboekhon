import { QuantityStepper } from "@/components/shop/order/QuantityStepper";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { Money } from "@/components/ui/Money";
import type { ProductImage } from "@/lib/product-images";

interface CheckoutProductProps {
  name: string;
  image: ProductImage | null;
  price: number;
  quantity: number;
  onQuantity: (quantity: number) => void;
}

// The ordered product with its quantity: top of the phone form, top of the desktop summary card.
export function CheckoutProduct({ name, image, price, quantity, onQuantity }: CheckoutProductProps) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-line bg-page">
          {image && <CloudinaryImage publicId={image.publicId} alt={name} fill sizes="64px" className="object-cover" />}
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-heading">{name}</p>
          <p className="mt-1 text-lg font-bold text-brand">
            <Money amount={price} bold />
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
        <span className="text-[15px] font-semibold text-body">পরিমাণ</span>
        <QuantityStepper value={quantity} onChange={onQuantity} compact />
      </div>
    </div>
  );
}
