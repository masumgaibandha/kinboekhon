import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import type { ProductImage } from "@/lib/product-images";

export function ProductListThumb({ image }: { image: ProductImage | null }) {
  if (!image) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-md border border-line bg-page text-muted">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-label="No image">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="m4 18 5-5 4 4 3-3 4 4" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative h-12 w-12 overflow-hidden rounded-md border border-line bg-page">
      <CloudinaryImage publicId={image.publicId} alt="" fill sizes="48px" className="object-cover" />
    </div>
  );
}
