import type { UploadSignature } from "@/lib/cloudinary/sign";
import { IMAGE_FORMATS, MAX_IMAGE_BYTES, type ProductImage } from "@/lib/product-images";

interface CloudinaryUploadResponse {
  public_id?: string;
  width?: number;
  height?: number;
  error?: { message?: string };
}

export function checkImageFile(file: File): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!IMAGE_FORMATS.includes(extension)) return `${file.name}: use a JPG, PNG, WebP or HEIC image.`;
  if (file.size > MAX_IMAGE_BYTES) return `${file.name}: larger than 10 MB.`;
  return null;
}

export async function getUploadSignature(): Promise<UploadSignature> {
  const response = await fetch("/api/admin/upload-signature", { method: "POST" });
  if (response.status === 401) throw new Error("Your session has ended. Log in again.");
  if (!response.ok) throw new Error("Could not start the upload. Try again.");
  return (await response.json()) as UploadSignature;
}

export async function uploadImage(file: File, signature: UploadSignature): Promise<ProductImage> {
  const body = new FormData();
  for (const [key, value] of Object.entries(signature.fields)) body.append(key, value);
  body.append("file", file);

  const failed = (reason: string) => new Error(`${file.name}: ${reason}`);
  let data: CloudinaryUploadResponse;
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
      method: "POST",
      body,
    });
    data = (await response.json()) as CloudinaryUploadResponse;
  } catch {
    throw failed("upload failed. Check the connection and try again.");
  }

  if (!data.public_id || !data.width || !data.height) throw failed(data.error?.message ?? "upload failed.");
  return { publicId: data.public_id, width: data.width, height: data.height };
}
