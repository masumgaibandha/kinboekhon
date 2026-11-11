import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-20 bg-brand text-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
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
      </div>
    </header>
  );
}
