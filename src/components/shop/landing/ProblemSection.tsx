import { LandingSection } from "@/components/shop/landing/LandingSection";
import type { ProductInput } from "@/lib/validation/product";

export function ProblemSection({ problem }: { problem: ProductInput["problem"] }) {
  if (!problem.title && problem.points.length === 0) return null;

  return (
    <LandingSection title={problem.title}>
      <ul className="space-y-2">
        {problem.points.map((point, index) => (
          <li key={index} className="flex gap-3 text-[17px] leading-relaxed text-body">
            <span aria-hidden="true" className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-muted" />
            {point}
          </li>
        ))}
      </ul>
    </LandingSection>
  );
}
