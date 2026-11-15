import { PriceTag } from "@/components/shop/PriceTag";
import { HeroMedia } from "@/components/shop/ad-landing/HeroMedia";
import { HeroColumns } from "@/components/shop/landing/HeroColumns";
import { OrderButton } from "@/components/shop/landing/OrderButton";
import { TrustBadges } from "@/components/shop/landing/TrustBadges";
import type { LandingProduct } from "@/lib/catalog";
import { videoEmbed } from "@/lib/landing/video";
import type { LandingValues } from "@/lib/validation/landing";

interface AdHeroProps {
  product: LandingProduct;
  landing: LandingValues;
  soldOut: boolean;
}

export function AdHero({ product, landing, soldOut }: AdHeroProps) {
  const video = landing.heroVideoUrl ? videoEmbed(landing.heroVideoUrl) : null;

  return (
    <HeroColumns
      top={
        <>
          <h1 className="text-[28px] font-bold leading-[1.3] text-body sm:text-[30px] lg:text-[36px]">
            {landing.headline || product.name}
          </h1>
          {landing.subheadline && <p className="mt-3 text-[17px] leading-relaxed text-desc lg:text-lg">{landing.subheadline}</p>}
        </>
      }
      media={<HeroMedia image={landing.heroImage ?? product.images[0] ?? null} video={video} alt={product.name} />}
      bottom={
        <div className="mt-4 space-y-3.5 lg:mt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="text-sm font-semibold text-brand-dark">{product.name}</p>
            <PriceTag price={product.price} size="lg" />
          </div>
          <OrderButton soldOut={soldOut} />
          <TrustBadges />
        </div>
      }
    />
  );
}
