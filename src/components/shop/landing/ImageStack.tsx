import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import type { ProductImage } from "@/lib/product-images";

interface ImageStackProps {
  images: ProductImage[];
  alt: string;
  columns: 1 | 2;
}

// Shows each image at its own shape, so nothing is cropped.
export function ImageStack({ images, alt, columns }: ImageStackProps) {
  if (images.length === 0) return null;
  const sizes = columns === 2 ? "(min-width: 576px) 260px, calc(50vw - 30px)" : "(min-width: 576px) 536px, calc(100vw - 40px)";

  return (
    <div className={`mt-4 grid gap-3 ${columns === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
      {images.map((image, index) => (
        <CloudinaryImage
          key={image.publicId}
          publicId={image.publicId}
          alt={`${alt} ${index + 1}`}
          width={image.width}
          height={image.height}
          sizes={sizes}
          className="h-auto w-full rounded-lg border border-line bg-card"
        />
      ))}
    </div>
  );
}
