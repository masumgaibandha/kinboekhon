import type { LandingProduct } from "@/lib/catalog";
import { shareImageUrl } from "@/lib/seo/share-image";
import { SITE_NAME, SITE_URL } from "@/lib/site";

interface ProductJsonLdProps {
  product: LandingProduct;
  // True only when orders are blocked: 0 stock while Settings hides the order button at 0 stock.
  soldOut: boolean;
}

// Product rich result data for search engines: name, image, price in BDT and stock.
export function ProductJsonLd({ product, soldOut }: ProductJsonLdProps) {
  const url = `${SITE_URL}/p/${product.slug}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.hook.subheadline || undefined,
    image: product.images.slice(0, 3).map((image) => shareImageUrl(image.publicId)),
    url,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url,
      price: product.price,
      priceCurrency: "BDT",
      availability: soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  // "<" is escaped so product text can never close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }} />;
}
