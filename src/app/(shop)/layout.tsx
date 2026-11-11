import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { NoticeStrip } from "@/components/shop/NoticeStrip";

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <NoticeStrip />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
