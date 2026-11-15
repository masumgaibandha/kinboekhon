import Link from "next/link";

export default function CategoryNotFound() {
  return (
    <div className="mx-auto max-w-shop px-4 py-6">
      <section className="rounded-xl border border-line bg-card px-5 py-8 text-center">
        <h1 className="text-xl font-bold leading-snug text-heading">এই ক্যাটাগরিটি পাওয়া যাচ্ছে না</h1>
        <p className="mt-2 text-desc">লিংকটি হয়তো ভুল বা পুরনো। হোম পেজে আমাদের সব পণ্য দেখুন।</p>
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
