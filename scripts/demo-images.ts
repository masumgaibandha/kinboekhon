import { imageFolder, type ImageKind } from "@/lib/cloudinary/folder";
import { signParams } from "@/lib/cloudinary/sign";
import { requiredEnv } from "@/lib/env";
import type { ProductImage } from "@/lib/product-images";

interface PlaceholderOptions {
  width: number;
  height: number;
  background: string;
  title: string;
  subtitle: string;
}

// A plain coloured placeholder with an English label (Cloudinary's SVG renderer has no Bangla font).
function placeholderSvg({ width, height, background, title, subtitle }: PlaceholderOptions): string {
  const size = Math.round(Math.min(width, height) / 9);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="${background}"/>
<rect x="${size / 2}" y="${size / 2}" width="${width - size}" height="${height - size}" fill="none" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="${size / 8}" stroke-dasharray="${size / 2} ${size / 3}" rx="${size / 2}"/>
<text x="50%" y="46%" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="700" text-anchor="middle">${title}</text>
<text x="50%" y="62%" fill="#FFFFFF" fill-opacity="0.85" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(size * 0.5)}" text-anchor="middle">${subtitle}</text>
</svg>`;
}

interface UploadResponse {
  public_id?: string;
  width?: number;
  height?: number;
  error?: { message?: string };
}

// Uploads the placeholder as a PNG under a fixed demo id, so running the seed again replaces it.
export async function uploadPlaceholder(kind: ImageKind, name: string, options: PlaceholderOptions): Promise<ProductImage> {
  const params: Record<string, string> = {
    folder: imageFolder(kind),
    format: "png",
    overwrite: "true",
    public_id: `demo-${name}`,
    timestamp: String(Math.floor(Date.now() / 1000)),
  };
  const body = new FormData();
  for (const [key, value] of Object.entries(params)) body.append(key, value);
  body.append("api_key", requiredEnv("CLOUDINARY_API_KEY"));
  body.append("signature", signParams(params));
  body.append("file", `data:image/svg+xml;base64,${Buffer.from(placeholderSvg(options)).toString("base64")}`);

  const cloud = requiredEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body });
  const data = (await response.json()) as UploadResponse;
  if (!data.public_id || !data.width || !data.height) {
    throw new Error(`Cloudinary upload of ${name} failed: ${data.error?.message ?? response.status}`);
  }
  return { publicId: data.public_id, width: data.width, height: data.height };
}
