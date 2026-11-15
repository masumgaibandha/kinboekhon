"use client";

import { useState } from "react";

import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import type { VideoEmbed } from "@/lib/landing/video";
import type { ProductImage } from "@/lib/product-images";

interface HeroMediaProps {
  image: ProductImage | null;
  video: VideoEmbed | null;
  alt: string;
}

const SIZES = "(min-width: 576px) 536px, calc(100vw - 40px)";

// The video player loads only after a tap, so the page stays fast; until then the cover image shows.
export function HeroMedia({ image, video, alt }: HeroMediaProps) {
  const [playing, setPlaying] = useState(false);

  if (video && playing) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-lg bg-footer">
        <iframe
          src={video.embedUrl}
          title={alt}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  const cover = image ? (
    <CloudinaryImage publicId={image.publicId} alt={alt} fill sizes={SIZES} preload className={video ? "object-cover" : "object-contain"} />
  ) : video?.thumbnail ? (
    // eslint-disable-next-line @next/next/no-img-element -- YouTube's still image is not on Cloudinary
    <img src={video.thumbnail} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
  ) : null;

  if (!video) {
    return cover && <div className="relative aspect-square overflow-hidden rounded-lg bg-card">{cover}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label="ভিডিও দেখুন"
      className="group relative block aspect-video w-full overflow-hidden rounded-lg bg-footer"
    >
      {cover}
      <span className="absolute inset-0 flex items-center justify-center bg-footer/20">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-transform group-hover:scale-105">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-7 w-7">
            <path d="M7 4.5v15l12.5-7.5Z" />
          </svg>
        </span>
      </span>
      <span className="absolute bottom-3 left-3 rounded bg-footer/75 px-2 py-1 text-sm font-semibold text-white">ভিডিও দেখুন</span>
    </button>
  );
}
