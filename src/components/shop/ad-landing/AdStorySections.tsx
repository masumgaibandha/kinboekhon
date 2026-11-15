import { BenefitIconSvg } from "@/components/shop/ad-landing/BenefitIconSvg";
import { Gallery } from "@/components/shop/landing/Gallery";
import { LandingSection } from "@/components/shop/landing/LandingSection";
import type { LandingValues } from "@/lib/validation/landing";

const ITEM = "flex gap-3 text-[17px] leading-relaxed text-body";

export function ProblemBlock({ problem }: { problem: LandingValues["problem"] }) {
  if (problem.points.length === 0) return null;
  return (
    <LandingSection title={problem.title || "আপনার কি এই সমস্যা হয়?"}>
      <ul className="space-y-2">
        {problem.points.map((point, index) => (
          <li key={index} className={ITEM}>
            <span aria-hidden="true" className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-muted" />
            {point}
          </li>
        ))}
      </ul>
    </LandingSection>
  );
}

export function SolutionBlock({ solution }: { solution: LandingValues["solution"] }) {
  const paragraphs = solution.text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) return null;
  return (
    <LandingSection title={solution.title || "সমাধান"}>
      <div className="space-y-3">
        {paragraphs.map((text, index) => (
          <p key={index} className="text-[17px] leading-relaxed text-desc">
            {text}
          </p>
        ))}
      </div>
    </LandingSection>
  );
}

export function BenefitsBlock({ benefits }: { benefits: LandingValues["benefits"] }) {
  if (benefits.items.length === 0) return null;
  return (
    <LandingSection title={benefits.title || "কেন এটি নেবেন"}>
      <ul className="space-y-3">
        {benefits.items.map((item, index) => (
          <li key={index} className="flex items-center gap-3 text-[17px] font-medium leading-snug text-heading">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
              <BenefitIconSvg icon={item.icon} className="h-5 w-5" />
            </span>
            {item.text}
          </li>
        ))}
      </ul>
    </LandingSection>
  );
}

export function GalleryBlock({ gallery, alt }: { gallery: LandingValues["gallery"]; alt: string }) {
  if (gallery.images.length === 0) return null;
  return (
    <LandingSection title={gallery.title || "ছবিতে দেখুন"}>
      <Gallery images={gallery.images} alt={alt} lazy />
    </LandingSection>
  );
}
