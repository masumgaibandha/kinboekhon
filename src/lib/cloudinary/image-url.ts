import type { ImageLoaderProps } from "next/image";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

// f_auto serves AVIF or WebP when the browser supports it, so HEIC originals display everywhere.
export function cloudinaryImageUrl(publicId: string, width: number): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,c_limit,w_${width}/${publicId}`;
}

export function cloudinaryLoader({ src, width }: ImageLoaderProps): string {
  return cloudinaryImageUrl(src, width);
}
