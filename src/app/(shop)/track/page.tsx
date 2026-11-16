import type { Metadata } from "next";
import { Suspense } from "react";

import { TrackForm } from "@/components/shop/track/TrackForm";
import { findTrackPrefill } from "@/lib/orders/order-status";
import { getSettings } from "@/lib/settings";
import { pageMetadata } from "@/lib/seo/page-metadata";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ title: "অর্ডার ট্র্যাক করুন", description: "অর্ডার নম্বর ও মোবাইল নম্বর দিয়ে আপনার অর্ডারের অবস্থা দেখুন।", path: "/track" });
}

export default async function TrackPage({ searchParams }: PageProps<"/track">) {
  const { whatsappNumber } = await getSettings();

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <h1 className="text-[22px] font-bold leading-snug text-heading">অর্ডার ট্র্যাক করুন</h1>
      <p className="mt-1 mb-4 leading-relaxed text-desc">অর্ডার নম্বর ও অর্ডারের সময় দেওয়া মোবাইল নম্বর লিখুন।</p>
      <Suspense fallback={<TrackForm initial={null} whatsappNumber={whatsappNumber} />}>
        <PrefilledForm searchParams={searchParams} whatsappNumber={whatsappNumber} />
      </Suspense>
    </div>
  );
}

// The thank-you page links with ?ref=<publicId>, so both fields start filled in.
async function PrefilledForm({ searchParams, whatsappNumber }: Pick<PageProps<"/track">, "searchParams"> & { whatsappNumber: string }) {
  const { ref } = await searchParams;
  const initial = typeof ref === "string" ? await findTrackPrefill(ref) : null;
  return <TrackForm initial={initial} whatsappNumber={whatsappNumber} />;
}
