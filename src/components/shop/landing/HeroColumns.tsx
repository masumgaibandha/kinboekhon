import type { ReactNode } from "react";

interface HeroColumnsProps {
  top: ReactNode;
  media: ReactNode;
  bottom: ReactNode;
  // The text column stays on screen while the media column scrolls.
  sticky?: boolean;
}

// Phone: top text, media, bottom text in one column. From 1024px: media left (55%), all text right.
export function HeroColumns({ top, media, bottom, sticky = false }: HeroColumnsProps) {
  return (
    <section className="flex flex-col bg-card px-5 pb-5 pt-[22px] lg:grid lg:grid-cols-[55%_1fr] lg:items-start lg:gap-x-10 lg:rounded-lg lg:p-8">
      <div className={`contents lg:col-start-2 lg:row-start-1 lg:block ${sticky ? "lg:sticky lg:top-20" : "lg:self-center"}`}>
        <div>{top}</div>
        <div className="order-2 lg:order-none">{bottom}</div>
      </div>
      <div className="order-1 mt-4 lg:order-none lg:col-start-1 lg:row-start-1 lg:mt-0">{media}</div>
    </section>
  );
}
