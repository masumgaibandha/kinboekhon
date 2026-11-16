import type { MetadataRoute } from "next";

import { getActiveSlugs } from "@/lib/catalog";
import { getCategories } from "@/lib/categories/shop";
import { SITE_URL } from "@/lib/site";

const POLICY_PAGES = ["/privacy", "/terms", "/return-policy"];

// Home, categories, active products and policy pages. Ad landing pages (/l/) are noindex and left out.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, slugs] = await Promise.all([getCategories(), getActiveSlugs()]);
  const paths = [
    "/",
    ...categories.map((category) => `/c/${category.slug}`),
    ...slugs.map((slug) => `/p/${slug}`),
    ...POLICY_PAGES,
  ];
  return paths.map((path) => ({ url: `${SITE_URL}${path === "/" ? "" : path}` }));
}
