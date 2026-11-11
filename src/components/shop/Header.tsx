import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-card">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
        <Link href="/" aria-label="কিনবো এখন, হোম পেজ">
          <Image
            src="/brand/logo-horizontal.svg"
            alt="Kinbo Ekhon"
            width={604}
            height={120}
            preload
            className="h-8 w-auto"
          />
        </Link>
      </div>
    </header>
  );
}
