import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import type { ProductImage } from "@/lib/product-images";

interface ImageThumbProps {
  image: ProductImage;
  position: number;
  isFirst: boolean;
  isLast: boolean;
  isMain: boolean;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
}

const smallButton =
  "rounded-md border border-line-strong px-2 py-1 text-sm text-desc hover:text-brand disabled:opacity-40";

export function ImageThumb({ image, position, isFirst, isLast, isMain, onMove, onRemove }: ImageThumbProps) {
  return (
    <li className="rounded-lg border border-line p-2">
      <div className="relative aspect-square overflow-hidden rounded-md bg-page">
        <CloudinaryImage publicId={image.publicId} alt={`Image ${position}`} fill sizes="160px" className="object-cover" />
        {isMain && (
          <span className="absolute left-1 top-1 rounded bg-brand px-1.5 py-0.5 text-xs font-semibold text-white">Main</span>
        )}
      </div>
      <div className="mt-2 flex gap-1">
        <button type="button" onClick={() => onMove(-1)} disabled={isFirst} aria-label={`Move image ${position} earlier`} className={smallButton}>
          &larr;
        </button>
        <button type="button" onClick={() => onMove(1)} disabled={isLast} aria-label={`Move image ${position} later`} className={smallButton}>
          &rarr;
        </button>
        <button type="button" onClick={onRemove} aria-label={`Remove image ${position}`} className={`${smallButton} ml-auto`}>
          Remove
        </button>
      </div>
    </li>
  );
}
