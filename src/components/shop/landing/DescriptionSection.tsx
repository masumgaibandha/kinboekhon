import { LandingSection } from "@/components/shop/landing/LandingSection";
import { parseDescription, type DescriptionBlock } from "@/lib/description";

function Block({ block }: { block: DescriptionBlock }) {
  if (block.kind === "heading") {
    return <h2 className="mt-6 mb-2 text-[22px] font-bold leading-snug text-heading first:mt-0">{block.text}</h2>;
  }
  if (block.kind === "list") {
    return (
      <ul className="my-3 space-y-2">
        {block.items.map((item, index) => (
          <li key={index} className="flex gap-3 text-[17px] leading-relaxed text-body">
            <span aria-hidden="true" className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            {item}
          </li>
        ))}
      </ul>
    );
  }
  return <p className="my-3 text-[17px] leading-relaxed text-desc">{block.text}</p>;
}

export function DescriptionSection({ description }: { description: string }) {
  const blocks = parseDescription(description);
  if (blocks.length === 0) return null;

  return (
    <LandingSection>
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </LandingSection>
  );
}
