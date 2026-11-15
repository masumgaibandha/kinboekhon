import Image from "next/image";
import Link from "next/link";

import { CategoryMenu } from "@/components/shop/header/CategoryMenu";
import { SearchForm } from "@/components/shop/header/SearchForm";
import { PhoneIcon, TruckIcon } from "@/components/shop/icons";
import { getCategories } from "@/lib/categories/shop";
import { getSettings } from "@/lib/settings";

export async function Header() {
  const [{ supportPhone }, categories] = await Promise.all([getSettings(), getCategories()]);

  return (
    <header className="sticky top-0 z-20 bg-brand text-white">
      <div className="mx-auto flex h-14 max-w-shop items-center gap-3 px-4">
        <CategoryMenu categories={categories.map(({ id, name, slug }) => ({ id, name, slug }))} />
        <Link href="/" aria-label="কিনবো এখন, হোম পেজ" className="shrink-0">
          <Image
            src="/brand/logo-horizontal-white.svg"
            alt="Kinbo Ekhon"
            width={572}
            height={104}
            preload
            className="h-7 w-auto"
          />
        </Link>
        <SearchForm className="mx-4 hidden max-w-xl flex-1 md:flex" />
        <Link
          href="/track"
          className="ml-auto flex shrink-0 items-center gap-1.5 text-[15px] font-semibold text-white md:ml-0"
        >
          <TruckIcon className="h-5 w-5" />
          <span className="sr-only lg:not-sr-only">অর্ডার ট্র্যাক</span>
        </Link>
        {supportPhone && (
          <a
            href={`tel:${supportPhone}`}
            aria-label={`ফোন করুন ${supportPhone}`}
            className="flex items-center gap-1.5 text-[15px] font-semibold text-white"
          >
            <PhoneIcon className="h-4 w-4" />
            <span className="hidden min-[400px]:inline">{supportPhone}</span>
          </a>
        )}
      </div>
      <div className="px-4 pb-2.5 md:hidden">
        <SearchForm />
      </div>
    </header>
  );
}
