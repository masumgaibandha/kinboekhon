import type { Metadata } from "next";
import "./globals.css";

import { pageMetadata } from "@/lib/seo/page-metadata";
import { SITE_URL } from "@/lib/site";

// Defaults for every page; shop pages set their own title, canonical URL and share image.
export async function generateMetadata(): Promise<Metadata> {
  return { metadataBase: new URL(SITE_URL), ...(await pageMetadata({})) };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" data-scroll-behavior="smooth" className="h-full scroll-smooth antialiased">
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
