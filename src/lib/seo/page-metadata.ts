import type { Metadata } from "next";

import { shareImage, type ShareImage } from "@/lib/seo/share-image";
import { getSettings } from "@/lib/settings";
import { SITE_DESCRIPTION, SITE_NAME, SITE_SLOGAN } from "@/lib/site";

const MAX_DESCRIPTION = 160;

interface PageMetadataInput {
  // Without a title the page uses the shop name and slogan.
  title?: string;
  description?: string;
  // Path on the canonical site, like "/p/watch". Left out for private pages.
  path?: string;
  image?: ShareImage;
  noindex?: boolean;
}

function shortText(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= MAX_DESCRIPTION ? clean : `${clean.slice(0, MAX_DESCRIPTION - 3).trimEnd()}...`;
}

// Title, description, canonical URL, Open Graph and Twitter tags for one page.
export async function pageMetadata({ title, description, path, image, noindex }: PageMetadataInput): Promise<Metadata> {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | ${SITE_SLOGAN}`;
  const text = shortText(description || SITE_DESCRIPTION);
  const ogImage = image ?? shareImage((await getSettings()).shareImage, SITE_NAME);

  return {
    title: { absolute: fullTitle },
    description: text,
    alternates: path ? { canonical: path } : undefined,
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "bn_BD",
      title: fullTitle,
      description: text,
      url: path,
      images: [ogImage],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description: text, images: [ogImage.url] },
  };
}
