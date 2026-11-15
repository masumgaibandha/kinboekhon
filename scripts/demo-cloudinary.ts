import { IMAGE_KINDS, imageFolder } from "@/lib/cloudinary/folder";
import { signParams } from "@/lib/cloudinary/sign";
import { requiredEnv } from "@/lib/env";
import type { ProductImage } from "@/lib/product-images";

interface UploadResponse {
  public_id?: string;
  width?: number;
  height?: number;
  error?: { message?: string };
}

interface DeleteResponse {
  deleted?: Record<string, string>;
  partial?: boolean;
  error?: { message?: string };
}

function apiUrl(path: string): string {
  return `https://api.cloudinary.com/v1_1/${requiredEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME")}/${path}`;
}

// Signed upload of one file (a data URI or a Blob) with the given upload params.
export async function uploadImage(params: Record<string, string>, file: string | Blob, label: string): Promise<ProductImage> {
  const signed = { ...params, timestamp: String(Math.floor(Date.now() / 1000)) };
  const body = new FormData();
  for (const [key, value] of Object.entries(signed)) body.append(key, value);
  body.append("api_key", requiredEnv("CLOUDINARY_API_KEY"));
  body.append("signature", signParams(signed));
  body.append("file", file);

  const response = await fetch(apiUrl("image/upload"), { method: "POST", body });
  const data = (await response.json()) as UploadResponse;
  if (!data.public_id || !data.width || !data.height) {
    throw new Error(`Cloudinary upload of ${label} failed: ${data.error?.message ?? response.status}`);
  }
  return { publicId: data.public_id, width: data.width, height: data.height };
}

// Demo images live under `<kind>/demo/` (photos) or `<kind>/demo-` (placeholders). Real uploads get random ids without hyphens.
function demoPrefixes(): string[] {
  return IMAGE_KINDS.flatMap((kind) => [`${imageFolder(kind)}/demo/`, `${imageFolder(kind)}/demo-`]);
}

async function deleteByPrefix(prefix: string): Promise<number> {
  const auth = Buffer.from(`${requiredEnv("CLOUDINARY_API_KEY")}:${requiredEnv("CLOUDINARY_API_SECRET")}`).toString("base64");
  let count = 0;
  for (let round = 0; round < 20; round++) {
    const url = `${apiUrl("resources/image/upload")}?prefix=${encodeURIComponent(prefix)}&invalidate=true`;
    const response = await fetch(url, { method: "DELETE", headers: { Authorization: `Basic ${auth}` } });
    const data = (await response.json()) as DeleteResponse;
    if (!response.ok) throw new Error(`Cloudinary delete of ${prefix} failed: ${data.error?.message ?? response.status}`);
    count += Object.values(data.deleted ?? {}).filter((status) => status === "deleted").length;
    if (!data.partial) break;
  }
  return count;
}

export async function deleteDemoImages(): Promise<number> {
  let count = 0;
  for (const prefix of demoPrefixes()) count += await deleteByPrefix(prefix);
  return count;
}
