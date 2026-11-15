import Link from "next/link";

import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import type { ShopCategory } from "@/lib/categories/shop";

export function CategoryGrid({ categories }: { categories: ShopCategory[] }) {
  return (
    <ul className="grid grid-cols-4 gap-x-2 gap-y-4 rounded-xl border border-line bg-card p-3 sm:grid-cols-6 sm:p-4 lg:grid-cols-8">
      {categories.map((category) => (
        <li key={category.id}>
          <Link href={`/c/${category.slug}`} className="group flex flex-col items-center gap-2 text-center">
            <span className="relative flex aspect-square w-full max-w-20 items-center justify-center overflow-hidden rounded-full bg-brand-light">
              {category.image ? (
                <CloudinaryImage
                  publicId={category.image.publicId}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <span className="text-2xl font-bold text-brand">{category.name.slice(0, 1)}</span>
              )}
            </span>
            <span className="line-clamp-2 text-xs font-medium leading-snug text-body group-hover:text-brand-dark sm:text-sm">
              {category.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
