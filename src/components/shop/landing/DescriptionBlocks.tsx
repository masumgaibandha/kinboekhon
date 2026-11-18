import { parseDescription, splitBold, type DescriptionBlock } from "@/lib/description";

function Inline({ text }: { text: string }) {
  return splitBold(text).map((part, index) =>
    part.bold ? (
      <strong key={index} className="font-semibold text-heading">
        {part.text}
      </strong>
    ) : (
      part.text
    ),
  );
}

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
            <span>
              <Inline text={item} />
            </span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className="my-3 text-[17px] leading-relaxed text-desc">
      <Inline text={block.text} />
    </p>
  );
}

// Text in the description format: "## " heading, "- " bullet, "**bold**", other lines paragraphs.
export function DescriptionBlocks({ text }: { text: string }) {
  return parseDescription(text).map((block, index) => <Block key={index} block={block} />);
}
