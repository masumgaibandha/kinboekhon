import { createHash } from "node:crypto";

import { productImageFolder } from "@/lib/cloudinary/folder";
import { requiredEnv } from "@/lib/env";
import { IMAGE_FORMATS } from "@/lib/product-images";

// Cloudinary shrinks the stored original so its longest side is at most 2000 px.
const INCOMING_TRANSFORMATION = "c_limit,h_2000,w_2000";

export interface UploadSignature {
  cloudName: string;
  fields: Record<string, string>;
}

export function signProductImageUpload(): UploadSignature {
  const params: Record<string, string> = {
    allowed_formats: IMAGE_FORMATS.join(","),
    folder: productImageFolder(),
    timestamp: String(Math.floor(Date.now() / 1000)),
    transformation: INCOMING_TRANSFORMATION,
  };
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  const signature = createHash("sha1")
    .update(toSign + requiredEnv("CLOUDINARY_API_SECRET"))
    .digest("hex");

  return {
    cloudName: requiredEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
    fields: { ...params, api_key: requiredEnv("CLOUDINARY_API_KEY"), signature },
  };
}
