import { DescriptionBlocks } from "@/components/shop/landing/DescriptionBlocks";
import { LandingSection } from "@/components/shop/landing/LandingSection";

export function DescriptionSection({ description }: { description: string }) {
  if (!description.trim()) return null;

  return (
    <LandingSection>
      <DescriptionBlocks text={description} />
    </LandingSection>
  );
}
