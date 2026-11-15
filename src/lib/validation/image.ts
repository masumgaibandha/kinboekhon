import { z } from "zod";

import { imageFolder, type ImageKind } from "@/lib/cloudinary/folder";

const PUBLIC_ID_PATTERN = /^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/;

const imageSize = z.number().int().min(1).max(10000);

// A stored image: only its Cloudinary id inside the folder of its kind, and its size.
export function cloudinaryImage(kind: ImageKind) {
  return z.object({
    publicId: z
      .string()
      .regex(PUBLIC_ID_PATTERN, "Invalid image.")
      .refine((id) => id.startsWith(`${imageFolder(kind)}/`), "Invalid image."),
    width: imageSize,
    height: imageSize,
  });
}

// Images arrive as JSON in a hidden form field.
function jsonField(value: string, ctx: z.RefinementCtx, empty: string): unknown {
  try {
    return JSON.parse(value || empty);
  } catch {
    ctx.addIssue({ code: "custom", message: "Images could not be read. Reload the page." });
    return z.NEVER;
  }
}

export function imageListField(kind: ImageKind, max: number) {
  return z
    .string()
    .transform((value, ctx) => jsonField(value, ctx, "[]"))
    .pipe(z.array(cloudinaryImage(kind)).max(max, `Up to ${max} images.`));
}

// One optional image: "null" or empty when there is none.
export function singleImageField(kind: ImageKind) {
  return z
    .string()
    .transform((value, ctx) => jsonField(value, ctx, "null"))
    .pipe(cloudinaryImage(kind).nullable());
}

export function requiredImageField(kind: ImageKind) {
  return singleImageField(kind).refine((image) => image !== null, "Upload an image.");
}
