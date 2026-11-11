export interface ProductImage {
  publicId: string;
  width: number;
  height: number;
}

export const IMAGE_FORMATS: readonly string[] = ["jpg", "jpeg", "png", "webp", "heic"];

export const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,.heic,image/jpeg,image/png,image/webp,image/heic";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const IMAGE_LIMITS = {
  images: 8,
  "solution.images": 6,
  "proof.images": 10,
} as const;

export type ImageListName = keyof typeof IMAGE_LIMITS;
