import Link from "next/link";

export default function AdLandingNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <section className="rounded-xl border border-line bg-card px-5 py-8 text-center">
        <h1 className="text-xl font-bold leading-snug text-heading">এই অফারটি এখন চালু নেই</h1>
        <p className="mt-2 text-desc">পণ্যটি হয়তো আর বিক্রি হচ্ছে না, অথবা লিংকটি পুরনো। আমাদের অন্য পণ্যগুলো দেখুন।</p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-md bg-brand px-6 py-3 font-bold text-white transition-colors hover:bg-brand-dark"
        >
          হোম পেজে যান
        </Link>
      </section>
    </div>
  );
}
