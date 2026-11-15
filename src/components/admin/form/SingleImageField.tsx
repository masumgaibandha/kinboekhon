"use client";

import { useRef, useState, type ChangeEvent } from "react";
import toast from "react-hot-toast";

import { UPLOADING_FIELD } from "@/components/admin/products/ImageUploader";
import { checkImageFile, getUploadSignature, uploadImage } from "@/components/admin/products/upload-image";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import type { ImageKind } from "@/lib/cloudinary/folder";
import { IMAGE_ACCEPT, type ProductImage } from "@/lib/product-images";

interface SingleImageFieldProps {
  name: string;
  label: string;
  kind: ImageKind;
  image: ProductImage | null;
  hint?: string;
  error?: string;
  // Tailwind aspect class for the preview, like "aspect-[2/1]".
  aspect?: string;
  removable?: boolean;
}

export function SingleImageField({ name, label, kind, image: initial, hint, error, aspect = "aspect-square", removable }: SingleImageFieldProps) {
  const [image, setImage] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const problem = checkImageFile(file);
    if (problem) return void toast.error(problem);

    setUploading(true);
    try {
      setImage(await uploadImage(file, await getUploadSignature(kind)));
      toast.success("Uploaded. Save to keep the change.");
    } catch (uploadError) {
      toast.error(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-body">{label}</p>
      {hint && <p className="text-sm text-muted">{hint}</p>}
      <input type="hidden" name={name} value={JSON.stringify(image)} />
      {uploading && <input type="hidden" name={UPLOADING_FIELD} value="1" />}
      <div className={`relative w-full max-w-sm overflow-hidden rounded-lg border border-line bg-page ${aspect}`}>
        {image ? (
          <CloudinaryImage publicId={image.publicId} alt={label} fill sizes="384px" className="object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-sm text-muted">No image</span>
        )}
      </div>
      <input ref={inputRef} type="file" accept={IMAGE_ACCEPT} hidden onChange={handleFile} />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-light disabled:opacity-60"
        >
          {uploading ? "Uploading..." : image ? "Replace image" : "Upload image"}
        </button>
        {removable && image && (
          <button
            type="button"
            onClick={() => setImage(null)}
            className="rounded-lg border border-line-strong px-4 py-2 text-sm font-medium text-desc hover:text-brand"
          >
            Remove
          </button>
        )}
      </div>
      {error && <p className="text-sm text-brand-dark">{error}</p>}
    </div>
  );
}
