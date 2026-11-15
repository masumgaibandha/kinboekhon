import { CUSTOMER_TAG_LABELS, type CustomerTag } from "@/lib/customers/tags";

const STYLES: Record<CustomerTag, string> = {
  vip: "bg-heading text-white",
  risky: "border border-brand bg-brand-light text-brand-dark",
  blocked: "bg-brand-dark text-white",
};

export function TagBadges({ tags }: { tags: CustomerTag[] }) {
  if (tags.length === 0) return null;
  return (
    <span className="inline-flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span key={tag} className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[tag]}`}>
          {CUSTOMER_TAG_LABELS[tag]}
        </span>
      ))}
    </span>
  );
}
