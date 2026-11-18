import Image from "next/image";

import { DescriptionBlocks } from "@/components/shop/landing/DescriptionBlocks";
import { CURATOR } from "@/config/curator";

function Portrait() {
  const frame = "size-28 shrink-0 overflow-hidden rounded-full border-4 border-card shadow-sm md:size-36";
  if (!CURATOR.photo) {
    return (
      <div aria-hidden="true" className={`${frame} flex items-center justify-center bg-card text-3xl font-bold text-brand`}>
        {CURATOR.initials}
      </div>
    );
  }
  return (
    <div className={frame}>
      <Image src={CURATOR.photo} alt={CURATOR.name} width={288} height={288} unoptimized className="size-full object-cover" />
    </div>
  );
}

// Who picks every product: on each product page and ad landing page, above the order form.
export function CuratorCard() {
  return (
    <section className="mt-2.5 bg-brand-light px-5 py-6 lg:mt-4 lg:rounded-lg lg:px-8 lg:py-7">
      <div className="flex flex-col items-center gap-5 md:flex-row md:items-start md:gap-8">
        <Portrait />
        <div className="min-w-0 flex-1">
          <DescriptionBlocks text={CURATOR.body} />
          <blockquote className="mt-5 rounded-xl border-l-4 border-brand bg-card px-5 py-4">
            <span aria-hidden="true" className="block h-8 font-serif text-6xl leading-none text-brand">
              “
            </span>
            <p className="text-[17px] leading-relaxed text-body">{CURATOR.quote}</p>
            <footer className="mt-3">
              <p className="font-bold text-heading">{CURATOR.name}</p>
              <p className="text-sm text-desc">{CURATOR.title}</p>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
