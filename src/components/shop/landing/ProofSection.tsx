import { ImageStack } from "@/components/shop/landing/ImageStack";
import { LandingSection } from "@/components/shop/landing/LandingSection";
import type { ProductInput } from "@/lib/validation/product";

export function hasProof(proof: ProductInput["proof"]): boolean {
  return Boolean(proof.title) || proof.images.length > 0 || proof.reviews.length > 0;
}

export function ProofSection({ proof }: { proof: ProductInput["proof"] }) {
  if (!hasProof(proof)) return null;

  return (
    <LandingSection title={proof.title}>
      <ImageStack images={proof.images} alt="গ্রাহকের মতামত" columns={2} />
      {proof.reviews.length > 0 && (
        <ul className="mt-4 space-y-3">
          {proof.reviews.map((review, index) => (
            <li key={`${review.name}-${index}`} className="rounded-md border border-line bg-page p-4">
              <p className="leading-relaxed text-body">{review.text}</p>
              {review.name && <p className="mt-2 text-sm font-semibold text-brand-dark">{review.name}</p>}
            </li>
          ))}
        </ul>
      )}
    </LandingSection>
  );
}
