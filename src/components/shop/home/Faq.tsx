import { ChevronDownIcon } from "@/components/shop/icons";
import type { HomeContentValues } from "@/lib/validation/home-content";

export function Faq({ faq }: { faq: HomeContentValues["faq"] }) {
  if (faq.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-lg font-bold text-heading sm:text-xl">সাধারণ জিজ্ঞাসা</h2>
      <div className="divide-y divide-line rounded-xl border border-line bg-card">
        {faq.map((item, index) => (
          <details key={index} className="group">
            <summary className="flex list-none items-center justify-between gap-3 px-4 py-3.5 font-semibold text-heading [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronDownIcon className="h-5 w-5 shrink-0 text-brand transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-4 pb-4 leading-relaxed text-desc">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
