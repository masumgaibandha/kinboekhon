import { ImageStack } from "@/components/shop/landing/ImageStack";
import { LandingSection } from "@/components/shop/landing/LandingSection";
import type { ProductInput } from "@/lib/validation/product";

export function SolutionSection({ solution, name }: { solution: ProductInput["solution"]; name: string }) {
  if (!solution.title && solution.benefits.length === 0 && solution.images.length === 0) return null;

  return (
    <LandingSection title={solution.title}>
      <ul className="space-y-2">
        {solution.benefits.map((benefit, index) => (
          <li key={index} className="flex gap-2.5 text-[17px] font-medium leading-relaxed text-heading">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-1.5 h-4 w-4 shrink-0 text-brand"
            >
              <path d="M5 12.5 10 17 19 7" />
            </svg>
            {benefit}
          </li>
        ))}
      </ul>
      <ImageStack images={solution.images} alt={name} columns={1} />
    </LandingSection>
  );
}
