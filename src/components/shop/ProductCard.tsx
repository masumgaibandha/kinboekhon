import Link from "next/link";

import { PriceTag } from "@/components/shop/PriceTag";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import type { ProductCardData } from "@/lib/catalog";

interface ProductCardProps {
  product: ProductCardData;
  eager: boolean;
}

const IMAGE_SIZES = "(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw";

export function ProductCard({ product, eager }: ProductCardProps) {
  return (
    <Link
      href={`/p/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square bg-page">
        {product.image ? (
          <CloudinaryImage
            publicId={product.image.publicId}
            alt={product.name}
            fill
            sizes={IMAGE_SIZES}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : "auto"}
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">ছবি নেই</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-heading sm:text-base">{product.name}</h2>
        <PriceTag price={product.price} />
        <span className="mt-auto block rounded-lg bg-brand py-2 text-center text-sm font-bold text-white transition-colors group-hover:bg-brand-dark">
          অর্ডার করুন
        </span>
      </div>
    </Link>
  );
}
