import { PriceTag } from "@/components/shop/PriceTag";
import { Gallery } from "@/components/shop/landing/Gallery";
import { HeroColumns } from "@/components/shop/landing/HeroColumns";
import { OrderButton } from "@/components/shop/landing/OrderButton";
import { TrustBadges } from "@/components/shop/landing/TrustBadges";
import type { ProductInput } from "@/lib/validation/product";

export function HookSection({ product, soldOut }: { product: ProductInput; soldOut: boolean }) {
  const { hook, name } = product;
  const headline = hook.headline || name;

  return (
    <HeroColumns
      sticky
      top={
        <>
          {hook.headline && <p className="mb-1 text-sm font-semibold text-brand-dark">{name}</p>}
          <h1 className="text-[28px] font-bold leading-[1.3] text-body sm:text-[30px] lg:text-[32px]">{headline}</h1>
          {hook.subheadline && <p className="mt-3 text-[17px] leading-relaxed text-desc">{hook.subheadline}</p>}
        </>
      }
      media={<Gallery images={product.images} alt={name} />}
      bottom={
        <>
          {product.shortDescription && <p className="mt-4 leading-relaxed text-desc">{product.shortDescription}</p>}
          <div className="mt-4 space-y-3.5 lg:mt-6">
            <PriceTag price={product.price} size="lg" />
            <OrderButton soldOut={soldOut} />
            <TrustBadges />
          </div>
        </>
      }
    />
  );
}
