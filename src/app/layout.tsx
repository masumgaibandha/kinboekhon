import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "কিনবো এখন | দরকার যখন, কিনবো এখন",
    template: "%s | কিনবো এখন",
  },
  description: "দরকার যখন, কিনবো এখন। সারা দেশে ফ্রি ডেলিভারি, ক্যাশ অন ডেলিভারি।",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" data-scroll-behavior="smooth" className="h-full scroll-smooth antialiased">
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
