import { createHash } from "node:crypto";

import { imageFolder, type ImageKind } from "@/lib/cloudinary/folder";
import { requiredEnv } from "@/lib/env";
import { IMAGE_FORMATS } from "@/lib/product-images";

// Cloudinary shrinks the stored original so its longest side is at most 2000 px.
const INCOMING_TRANSFORMATION = "c_limit,h_2000,w_2000";

export interface UploadSignature {
  cloudName: string;
  fields: Record<string, string>;
}

// Cloudinary signature: the params sorted by name as `key=value&...`, then the API secret, SHA-1.
export function signParams(params: Record<string, string>): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1")
    .update(toSign + requiredEnv("CLOUDINARY_API_SECRET"))
    .digest("hex");
}

export function signImageUpload(kind: ImageKind): UploadSignature {
  const params: Record<string, string> = {
    allowed_formats: IMAGE_FORMATS.join(","),
    folder: imageFolder(kind),
    timestamp: String(Math.floor(Date.now() / 1000)),
    transformation: INCOMING_TRANSFORMATION,
  };

  return {
    cloudName: requiredEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
    fields: { ...params, api_key: requiredEnv("CLOUDINARY_API_KEY"), signature: signParams(params) },
  };
}
