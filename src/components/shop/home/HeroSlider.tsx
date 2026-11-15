"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ImgHTMLAttributes, type ReactNode } from "react";

import { isInternalLink } from "@/lib/banners/link";

export interface HeroSlide {
  id: string;
  title: string;
  link: string;
  desktopSrcSet: string;
  image: ImgHTMLAttributes<HTMLImageElement>;
}

const INTERVAL_MS = 5000;

function SlideLink({ link, title, children }: { link: string; title: string; children: ReactNode }) {
  const className = "block h-full w-full";
  if (!link) return <div className={className}>{children}</div>;
  if (isInternalLink(link)) {
    return (
      <Link href={link} aria-label={title} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={link} aria-label={title} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

export function HeroSlider({ slides, sizes }: { slides: HeroSlide[]; sizes: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [current, setCurrent] = useState(0);

  function show(index: number) {
    const track = trackRef.current;
    track?.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  }

  // Auto-slide, paused while the visitor touches or hovers it and when motion is reduced.
  useEffect(() => {
    if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      const track = trackRef.current;
      if (!track || pausedRef.current || document.hidden) return;
      const next = (Math.round(track.scrollLeft / track.clientWidth) + 1) % slides.length;
      track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  function hold() {
    pausedRef.current = true;
  }

  function release() {
    pausedRef.current = false;
  }

  return (
    <section aria-label="অফার" className="mx-auto max-w-5xl px-3 pt-3 sm:px-4">
      <div
        ref={trackRef}
        onScroll={(event) => setCurrent(Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth))}
        onPointerEnter={hold}
        onPointerLeave={release}
        onTouchStart={hold}
        onTouchEnd={release}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-xl bg-card [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} / ${slides.length}`}
            className="aspect-[2/1] w-full shrink-0 snap-center md:aspect-[16/5]"
          >
            <SlideLink link={slide.link} title={slide.title}>
              <picture>
                <source media="(min-width: 768px)" srcSet={slide.desktopSrcSet} sizes={sizes} />
                <img {...slide.image} alt={slide.title} className="h-full w-full object-cover" />
              </picture>
            </SlideLink>
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="mt-2 flex justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => show(index)}
              aria-label={`ব্যানার ${index + 1} দেখুন`}
              aria-current={index === current}
              className={`h-2 rounded-full transition-all ${index === current ? "w-5 bg-brand" : "w-2 bg-line-strong"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
