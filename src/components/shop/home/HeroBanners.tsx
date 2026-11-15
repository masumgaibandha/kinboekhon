import { getImageProps } from "next/image";

import { HeroSlider, type HeroSlide } from "@/components/shop/home/HeroSlider";
import type { ShopBanner } from "@/lib/banners/shop";
import { cloudinaryLoader } from "@/lib/cloudinary/image-url";

const SIZES = "(min-width: 1024px) 992px, 100vw";

// Builds a mobile and a desktop source for each banner; the browser loads only the one it shows.
function toSlide(banner: ShopBanner, first: boolean): HeroSlide {
  const common = { alt: banner.title, sizes: SIZES, loader: cloudinaryLoader };
  const desktop = getImageProps({ ...common, src: banner.desktopImage.publicId, width: banner.desktopImage.width, height: banner.desktopImage.height });
  const { props: mobile } = getImageProps({
    ...common,
    src: banner.mobileImage.publicId,
    width: banner.mobileImage.width,
    height: banner.mobileImage.height,
    loading: first ? "eager" : "lazy",
    fetchPriority: first ? "high" : "auto",
  });
  return { id: banner.id, title: banner.title, link: banner.link, desktopSrcSet: desktop.props.srcSet ?? "", image: mobile };
}

export function HeroBanners({ banners }: { banners: ShopBanner[] }) {
  if (banners.length === 0) return null;
  return <HeroSlider slides={banners.map((banner, index) => toSlide(banner, index === 0))} sizes={SIZES} />;
}
