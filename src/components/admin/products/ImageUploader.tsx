"use client";

import { useRef, useState, type ChangeEvent } from "react";
import toast from "react-hot-toast";

import { ImageThumb } from "@/components/admin/products/ImageThumb";
import { checkImageFile, getUploadSignature, uploadImage } from "@/components/admin/products/upload-image";
import { IMAGE_ACCEPT, IMAGE_LIMITS, type ImageListName, type ProductImage } from "@/lib/product-images";

interface ImageUploaderProps {
  name: ImageListName;
  label: string;
  hint?: string;
  images: ProductImage[];
  errors: Record<string, string>;
  markMain?: boolean;
}

export const UPLOADING_FIELD = "imagesUploading";

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "Upload failed.");

export function ImageUploader({ name, label, hint, images: initial, errors, markMain }: ImageUploaderProps) {
  const [images, setImages] = useState(initial);
  const [uploading, setUploading] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const max = IMAGE_LIMITS[name];
  const room = max - images.length;
  const error = Object.entries(errors).find(([key]) => key === name || key.startsWith(`${name}.`))?.[1];

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    if (files.length > room) {
      toast.error(`You can add ${room} more image${room === 1 ? "" : "s"} here (up to ${max}).`);
      return;
    }

    const valid = files.filter((file) => {
      const problem = checkImageFile(file);
      if (problem) toast.error(problem);
      return !problem;
    });
    if (valid.length === 0) return;

    setUploading(valid.length);
    try {
      const signature = await getUploadSignature();
      const results = await Promise.allSettled(valid.map((file) => uploadImage(file, signature)));
      const uploaded = results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
      results.forEach((result) => result.status === "rejected" && toast.error(errorMessage(result.reason)));
      setImages((current) => [...current, ...uploaded]);
      if (uploaded.length > 0) toast.success("Uploaded. Save the product to keep the changes.");
    } catch (uploadError) {
      toast.error(errorMessage(uploadError));
    } finally {
      setUploading(0);
    }
  }

  function move(index: number, delta: -1 | 1) {
    setImages((current) => {
      const next = [...current];
      [next[index], next[index + delta]] = [next[index + delta], next[index]];
      return next;
    });
  }

  return (
    <div className="space-y-3 sm:col-span-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-body">{label}</p>
        <span className="text-xs text-muted">
          {images.length} / {max}
        </span>
      </div>
      {hint && <p className="text-sm text-desc">{hint}</p>}

      <input type="hidden" name={name} value={JSON.stringify(images)} />
      {uploading > 0 && <input type="hidden" name={UPLOADING_FIELD} value="1" />}

      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image, index) => (
            <ImageThumb
              key={image.publicId}
              image={image}
              position={index + 1}
              isFirst={index === 0}
              isLast={index === images.length - 1}
              isMain={Boolean(markMain) && index === 0}
              onMove={(delta) => move(index, delta)}
              onRemove={() => setImages((current) => current.filter((_, i) => i !== index))}
            />
          ))}
        </ul>
      )}

      <input ref={inputRef} type="file" accept={IMAGE_ACCEPT} multiple hidden onChange={handleFiles} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading > 0 || room <= 0}
        className="rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-light disabled:opacity-60"
      >
        {uploading > 0 ? `Uploading ${uploading}...` : "Add images"}
      </button>
      {error && <p className="text-sm text-brand-dark">{error}</p>}
    </div>
  );
}
