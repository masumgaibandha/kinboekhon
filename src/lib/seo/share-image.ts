import type { ProductImage } from "@/lib/product-images";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export const SHARE_WIDTH = 1200;
export const SHARE_HEIGHT = 630;

// Shown when no share image is set in Settings: the white logo on brand orange.
export const FALLBACK_SHARE_IMAGE = "/brand/share-default.jpg";

export interface ShareImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

// Facebook needs a JPG or PNG; 1200x630 filled around the most important part of the photo.
export function shareImageUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,g_auto,w_${SHARE_WIDTH},h_${SHARE_HEIGHT},f_jpg,q_auto/${publicId}`;
}

export function shareImage(image: ProductImage | null, alt: string): ShareImage {
  const url = image ? shareImageUrl(image.publicId) : FALLBACK_SHARE_IMAGE;
  return { url, width: SHARE_WIDTH, height: SHARE_HEIGHT, alt };
}
