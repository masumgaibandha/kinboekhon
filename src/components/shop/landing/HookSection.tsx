import { PriceTag } from "@/components/shop/PriceTag";
import { Gallery } from "@/components/shop/landing/Gallery";
import { OrderButton } from "@/components/shop/landing/OrderButton";
import { TrustBadges } from "@/components/shop/landing/TrustBadges";
import type { ProductInput } from "@/lib/validation/product";

export function HookSection({ product }: { product: ProductInput }) {
  const { hook, name } = product;
  const headline = hook.headline || name;

  return (
    <section className="bg-card px-5 pb-5 pt-[22px]">
      {hook.headline && <p className="mb-1 text-sm font-semibold text-brand-dark">{name}</p>}
      <h1 className="text-[28px] font-bold leading-[1.3] text-body sm:text-[30px]">{headline}</h1>
      {hook.subheadline && <p className="mt-3 text-[17px] leading-relaxed text-desc">{hook.subheadline}</p>}

      <div className="mt-4">
        <Gallery images={product.images} alt={name} />
      </div>

      {product.shortDescription && <p className="mt-4 leading-relaxed text-desc">{product.shortDescription}</p>}

      <div className="mt-4 space-y-3.5">
        <PriceTag price={product.price} oldPrice={product.oldPrice} size="lg" />
        <OrderButton />
        <TrustBadges />
      </div>
    </section>
  );
}
