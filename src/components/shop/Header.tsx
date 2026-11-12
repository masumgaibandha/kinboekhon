import Image from "next/image";
import Link from "next/link";

import { PhoneIcon } from "@/components/shop/icons";
import { getSettings } from "@/lib/settings";

export async function Header() {
  const { supportPhone } = await getSettings();

  return (
    <header className="sticky top-0 z-20 bg-brand text-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <Link href="/" aria-label="কিনবো এখন, হোম পেজ">
          <Image
            src="/brand/logo-horizontal-white.svg"
            alt="Kinbo Ekhon"
            width={572}
            height={104}
            preload
            className="h-7 w-auto"
          />
        </Link>
        {supportPhone && (
          <a
            href={`tel:${supportPhone}`}
            aria-label={`ফোন করুন ${supportPhone}`}
            className="flex items-center gap-1.5 text-[15px] font-semibold text-white"
          >
            <PhoneIcon className="h-4 w-4" />
            {supportPhone}
          </a>
        )}
      </div>
    </header>
  );
}
