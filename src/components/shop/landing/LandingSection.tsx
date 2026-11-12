import type { ReactNode } from "react";

interface LandingSectionProps {
  title?: string;
  id?: string;
  className?: string;
  children: ReactNode;
}

export function LandingSection({ title, id, className = "", children }: LandingSectionProps) {
  return (
    <section id={id} className={`mt-2.5 bg-card px-5 py-5 ${className}`}>
      {title && <h2 className="mb-3 text-[22px] font-bold leading-snug text-heading">{title}</h2>}
      {children}
    </section>
  );
}
