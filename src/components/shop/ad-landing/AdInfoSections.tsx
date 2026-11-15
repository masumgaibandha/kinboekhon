import { BenefitIconSvg } from "@/components/shop/ad-landing/BenefitIconSvg";
import { LandingSection } from "@/components/shop/landing/LandingSection";
import type { LandingValues } from "@/lib/validation/landing";

const ITEM = "flex gap-3 text-[17px] leading-relaxed text-body";

export function StepsBlock({ howTo }: { howTo: LandingValues["howTo"] }) {
  if (howTo.steps.length === 0) return null;
  return (
    <LandingSection title={howTo.title || "কীভাবে ব্যবহার করবেন"}>
      <ol className="space-y-3">
        {howTo.steps.map((step, index) => (
          <li key={index} className={ITEM}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </LandingSection>
  );
}

export function InBoxBlock({ inBox }: { inBox: LandingValues["inBox"] }) {
  if (inBox.items.length === 0) return null;
  return (
    <LandingSection title={inBox.title || "বক্সে যা পাবেন"}>
      <ul className="space-y-2">
        {inBox.items.map((item, index) => (
          <li key={index} className={ITEM}>
            <BenefitIconSvg icon="gift" className="mt-1 h-5 w-5 shrink-0 text-brand" />
            {item}
          </li>
        ))}
      </ul>
    </LandingSection>
  );
}

export function SpecsBlock({ specs }: { specs: LandingValues["specs"] }) {
  if (specs.rows.length === 0) return null;
  return (
    <LandingSection title={specs.title || "স্পেসিফিকেশন"}>
      <dl className="divide-y divide-line overflow-hidden rounded-md border border-line">
        {specs.rows.map((row, index) => (
          <div key={index} className="grid grid-cols-[40%_1fr] gap-3 px-3 py-2.5 text-[15px] odd:bg-page">
            <dt className="font-semibold text-heading">{row.label}</dt>
            <dd className="text-body">{row.value}</dd>
          </div>
        ))}
      </dl>
    </LandingSection>
  );
}

export function GuaranteeBlock({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="mt-2.5 flex items-center gap-3 bg-brand-light px-5 py-4 text-[17px] font-semibold text-brand-dark">
      <BenefitIconSvg icon="shield" className="h-7 w-7 shrink-0" />
      {text}
    </div>
  );
}

export function FaqBlock({ faq }: { faq: LandingValues["faq"] }) {
  if (faq.length === 0) return null;
  return (
    <LandingSection title="সাধারণ জিজ্ঞাসা">
      <div className="divide-y divide-line rounded-md border border-line">
        {faq.map((item, index) => (
          <details key={index} className="group">
            <summary className="flex list-none items-center justify-between gap-3 px-4 py-3.5 font-semibold text-heading [&::-webkit-details-marker]:hidden">
              {item.question}
              <span aria-hidden="true" className="text-xl leading-none text-brand transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="px-4 pb-4 leading-relaxed text-desc">{item.answer}</p>
          </details>
        ))}
      </div>
    </LandingSection>
  );
}
