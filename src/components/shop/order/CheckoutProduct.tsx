import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { Money } from "@/components/ui/Money";
import type { ProductImage } from "@/lib/product-images";

interface CheckoutProductProps {
  name: string;
  image: ProductImage | null;
  price: number;
}

// The product line at the top of the desktop order summary card; phones already see the product above the form.
export function CheckoutProduct({ name, image, price }: CheckoutProductProps) {
  return (
    <div className="hidden items-center gap-3 lg:flex">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-line bg-page">
        {image && <CloudinaryImage publicId={image.publicId} alt={name} fill sizes="64px" className="object-cover" />}
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-heading">{name}</p>
        <p className="mt-0.5 text-lg font-bold text-brand">
          <Money amount={price} bold />
        </p>
      </div>
    </div>
  );
}
