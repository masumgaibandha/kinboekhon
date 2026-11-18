export type DescriptionBlock =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

export interface TextPart {
  text: string;
  bold: boolean;
}

// Inline "**text**" becomes bold; an unclosed "**" stays as typed.
export function splitBold(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let rest = text;
  for (let match = /\*\*(.+?)\*\*/.exec(rest); match; match = /\*\*(.+?)\*\*/.exec(rest)) {
    if (match.index > 0) parts.push({ text: rest.slice(0, match.index), bold: false });
    parts.push({ text: match[1], bold: true });
    rest = rest.slice(match.index + match[0].length);
  }
  if (rest) parts.push({ text: rest, bold: false });
  return parts;
}

// Full description text to blocks: "## " starts a heading, "- " a bullet (next bullets join one list), other lines are paragraphs.
export function parseDescription(text: string): DescriptionBlock[] {
  const blocks: DescriptionBlock[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("## ")) {
      blocks.push({ kind: "heading", text: line.slice(3).trim() });
    } else if (line.startsWith("- ")) {
      const last = blocks.at(-1);
      const item = line.slice(2).trim();
      if (last?.kind === "list") last.items.push(item);
      else blocks.push({ kind: "list", items: [item] });
    } else {
      blocks.push({ kind: "paragraph", text: line });
    }
  }
  return blocks;
}
