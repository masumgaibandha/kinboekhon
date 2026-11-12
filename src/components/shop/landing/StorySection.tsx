import { LandingSection } from "@/components/shop/landing/LandingSection";
import type { ProductInput } from "@/lib/validation/product";

export function StorySection({ story }: { story: ProductInput["story"] }) {
  if (!story.title && !story.body) return null;

  return (
    <LandingSection title={story.title}>
      {story.body && <p className="whitespace-pre-line text-[17px] leading-relaxed text-desc">{story.body}</p>}
    </LandingSection>
  );
}
