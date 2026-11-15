import Image from "next/image";

import { MetaPixel } from "@/components/tracking/MetaPixel";

// Ad landing pages: logo only, no menu and no links away from the order form.
export default function AdLandingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <MetaPixel />
      <header className="sticky top-0 z-20 bg-brand">
        <div className="mx-auto flex h-14 max-w-shop items-center justify-center px-4 lg:justify-start">
          <Image src="/brand/logo-horizontal-white.svg" alt="Kinbo Ekhon" width={572} height={104} preload className="h-7 w-auto" />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-footer px-4 pt-5 pb-24 text-center text-xs text-white/70 md:pb-5">
        © কিনবো এখন · দরকার যখন, কিনবো এখন
      </footer>
    </>
  );
}
