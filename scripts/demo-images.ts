import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { imageFolder, type ImageKind } from "@/lib/cloudinary/folder";
import type { ProductImage } from "@/lib/product-images";

import { uploadImage } from "./demo-cloudinary";

const PHOTO_ROOT = path.join(process.cwd(), "public", "demo-products");
const PHOTO_TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

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

// Uploads the placeholder as a PNG under a fixed demo id, so running the seed again replaces it.
export function uploadPlaceholder(kind: ImageKind, name: string, options: PlaceholderOptions): Promise<ProductImage> {
  const params = { folder: imageFolder(kind), format: "png", overwrite: "true", invalidate: "true", public_id: `demo-${name}` };
  const svg = `data:image/svg+xml;base64,${Buffer.from(placeholderSvg(options)).toString("base64")}`;
  return uploadImage(params, svg, name);
}

// Image file names of one demo product folder, in name order (the first is the main image). Videos are skipped.
export async function demoPhotoFiles(folder: string): Promise<string[]> {
  const files = await readdir(path.join(PHOTO_ROOT, folder));
  const photos = files.filter((file) => path.extname(file).toLowerCase() in PHOTO_TYPES).sort();
  if (photos.length === 0) throw new Error(`No images in public/demo-products/${folder}.`);
  return photos;
}

// Uploads one photo to `<kind>/demo/<name>`, longest side at most 2000 px like admin uploads.
export async function uploadPhoto(kind: ImageKind, name: string, folder: string, file: string): Promise<ProductImage> {
  const bytes = await readFile(path.join(PHOTO_ROOT, folder, file));
  const blob = new Blob([bytes], { type: PHOTO_TYPES[path.extname(file).toLowerCase()] });
  const params = {
    folder: `${imageFolder(kind)}/demo`,
    public_id: name,
    overwrite: "true",
    invalidate: "true",
    transformation: "c_limit,h_2000,w_2000",
  };
  return uploadImage(params, blob, `${folder}/${file}`);
}
