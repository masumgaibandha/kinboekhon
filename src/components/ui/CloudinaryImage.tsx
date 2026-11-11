"use client";

import Image, { type ImageProps } from "next/image";

import { cloudinaryLoader } from "@/lib/cloudinary/image-url";

type CloudinaryImageProps = Omit<ImageProps, "src" | "loader"> & { publicId: string };

export function CloudinaryImage({ publicId, alt, ...props }: CloudinaryImageProps) {
  return <Image {...props} alt={alt} src={publicId} loader={cloudinaryLoader} />;
}
