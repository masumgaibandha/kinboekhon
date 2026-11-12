"use client";

import { useRef, useState } from "react";

import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { toBanglaDigits } from "@/lib/money";
import type { ProductImage } from "@/lib/product-images";

interface GalleryProps {
  images: ProductImage[];
  alt: string;
}

const SIZES = "(min-width: 576px) 536px, calc(100vw - 40px)";

export function Gallery({ images, alt }: GalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  if (images.length === 0) return null;

  function handleScroll() {
    const track = trackRef.current;
    if (track) setCurrent(Math.round(track.scrollLeft / track.clientWidth));
  }

  function show(index: number) {
    const track = trackRef.current;
    track?.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  }

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-lg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((image, index) => (
          <div key={image.publicId} className="relative aspect-square w-full shrink-0 snap-center bg-card">
            <CloudinaryImage
              publicId={image.publicId}
              alt={index === 0 ? alt : `${alt}, ছবি ${toBanglaDigits(index + 1)}`}
              fill
              sizes={SIZES}
              preload={index === 0}
              className="object-contain"
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {images.map((image, index) => (
            <button
              key={image.publicId}
              type="button"
              onClick={() => show(index)}
              aria-label={`ছবি ${toBanglaDigits(index + 1)} দেখুন`}
              aria-current={index === current}
              className={`h-2 rounded-full transition-all ${index === current ? "w-5 bg-brand" : "w-2 bg-line-strong"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
