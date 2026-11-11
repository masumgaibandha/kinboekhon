import { requiredEnv } from "@/lib/env";

export function productImageFolder(): string {
  return `${requiredEnv("CLOUDINARY_UPLOAD_FOLDER")}/products`;
}
