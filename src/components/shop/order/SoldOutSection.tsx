import { LandingSection } from "@/components/shop/landing/LandingSection";

// Shown in place of the order form when Settings hide ordering at 0 stock.
export function SoldOutSection() {
  return (
    <LandingSection id="order" title="স্টক শেষ" className="scroll-mt-14 border-t-[3px] border-brand">
      <p className="text-[17px] leading-relaxed text-desc">এই পণ্যটির স্টক এখন শেষ। নতুন স্টক এলে আবার অর্ডার করতে পারবেন।</p>
    </LandingSection>
  );
}
