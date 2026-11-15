import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import type { HomeContentValues } from "@/lib/validation/home-content";

export function WhyUs({ why }: { why: HomeContentValues["why"] }) {
  const paragraphs = why.body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!why.title && paragraphs.length === 0) return null;

  return (
    <section className="mt-6 rounded-xl border border-line bg-card p-5 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
        {why.founderPhoto && (
          <figure className="flex shrink-0 flex-col items-center gap-2">
            <span className="relative block h-28 w-28 overflow-hidden rounded-full border-4 border-brand-light sm:h-36 sm:w-36">
              <CloudinaryImage
                publicId={why.founderPhoto.publicId}
                alt={why.founderName || why.title}
                fill
                sizes="144px"
                className="object-cover"
              />
            </span>
            {why.founderName && <figcaption className="text-sm font-semibold text-heading">{why.founderName}</figcaption>}
          </figure>
        )}
        <div className="space-y-3">
          {why.title && <h2 className="text-xl font-bold text-heading">{why.title}</h2>}
          {paragraphs.map((text, index) => (
            <p key={index} className="leading-relaxed text-desc">
              {text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
