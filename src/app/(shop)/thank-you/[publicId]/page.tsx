import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { ThankYouDetails } from "@/components/shop/order/ThankYouDetails";
import { getThankYouOrder } from "@/lib/orders/thank-you";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "অর্ডার গ্রহণ করা হয়েছে", robots: { index: false, follow: false } };

export default function ThankYouPage({ params }: PageProps<"/thank-you/[publicId]">) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <Suspense fallback={<p className="py-10 text-center text-desc">লোড হচ্ছে...</p>}>
        <ThankYou params={params} />
      </Suspense>
    </div>
  );
}

// Read on every visit, never cached: each order has its own page.
async function ThankYou({ params }: Pick<PageProps<"/thank-you/[publicId]">, "params">) {
  await connection();
  const { publicId } = await params;
  const order = await getThankYouOrder(publicId);
  if (!order) notFound();
  const { supportPhone } = await getSettings();

  return (
    <section className="rounded-xl border border-line bg-card px-5 py-6">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-brand">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-7 w-7">
            <path d="M5 12.5 10 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="mt-4 text-xl font-bold leading-snug text-heading">ধন্যবাদ! আপনার অর্ডারটি গ্রহণ করা হয়েছে</h1>
        <p className="mt-4 text-sm text-desc">অর্ডার নম্বর</p>
        <p className="text-3xl font-bold tracking-wide text-brand">{order.orderNumber}</p>
      </div>

      <div className="mt-6">
        <ThankYouDetails order={order} />
      </div>

      <p className="mt-5 text-center leading-relaxed text-body">আমরা শীঘ্রই ফোন করে আপনার অর্ডারটি কনফার্ম করব।</p>
      {supportPhone && (
        <p className="mt-2 text-center text-sm text-desc">
          কোনো প্রশ্ন থাকলে কল করুন:{" "}
          <a href={`tel:${supportPhone}`} className="font-semibold text-brand-dark underline">
            {supportPhone}
          </a>
        </p>
      )}

      <Link
        href="/"
        className="mt-6 block rounded-md border border-brand py-3 text-center font-bold text-brand transition-colors hover:bg-brand-light"
      >
        আরও পণ্য দেখুন
      </Link>
    </section>
  );
}
