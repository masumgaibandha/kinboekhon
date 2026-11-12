import { PriceTag } from "@/components/shop/PriceTag";
import { LandingSection } from "@/components/shop/landing/LandingSection";
import { OrderButton } from "@/components/shop/landing/OrderButton";
import type { ProductInput } from "@/lib/validation/product";

export function CtaSection({ product }: { product: ProductInput }) {
  const { cta } = product;
  if (!cta.title && !cta.text) return null;

  return (
    <LandingSection title={cta.title}>
      {cta.text && <p className="text-[17px] leading-relaxed text-desc">{cta.text}</p>}
      <div className="mt-4 space-y-3.5">
        <PriceTag price={product.price} oldPrice={product.oldPrice} size="lg" />
        <OrderButton />
      </div>
    </LandingSection>
  );
}
