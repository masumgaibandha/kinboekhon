import type { Metadata } from "next";

import type { LandingProduct } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { shareImage } from "@/lib/seo/share-image";

export function priceText(price: number): string {
  return `৳${price.toLocaleString("en-IN")}`;
}

// Product and landing pages: name and price in the title, the main image as the share picture.
export function productMetadata(product: LandingProduct, path: string, noindex?: boolean): Promise<Metadata> {
  return pageMetadata({
    title: `${product.name} - ${priceText(product.price)}`,
    description: product.shortDescription || product.hook.subheadline,
    path,
    image: product.images[0] ? shareImage(product.images[0], product.name) : undefined,
    noindex,
  });
}
