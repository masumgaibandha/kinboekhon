import { requiredEnv } from "@/lib/env";

// Each kind of upload has its own Cloudinary folder; saves check an image is inside the right one.
export const IMAGE_KINDS = ["products", "categories", "banners", "home"] as const;
export type ImageKind = (typeof IMAGE_KINDS)[number];

export function imageFolder(kind: ImageKind): string {
  return `${requiredEnv("CLOUDINARY_UPLOAD_FOLDER")}/${kind}`;
}

export function productImageFolder(): string {
  return imageFolder("products");
}
