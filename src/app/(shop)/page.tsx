export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <section className="rounded-xl border border-line bg-card px-5 py-8 text-center">
        <p className="text-sm font-semibold text-brand-dark">স্বাগতম</p>
        <h1 className="mt-2 text-2xl font-bold leading-snug text-heading">
          দরকার যখন, <span className="text-brand">কিনবো এখন</span>
        </h1>
        <p className="mt-3 text-desc">
          প্রয়োজনীয় সব পণ্য এক জায়গায়। পণ্য হাতে পেয়ে টাকা দিন।
        </p>
      </section>

      <section className="mt-4 rounded-xl border border-line bg-card px-5 py-10 text-center">
        <p className="font-medium text-body">আমাদের পণ্যগুলো খুব শীঘ্রই এখানে দেখতে পাবেন।</p>
      </section>
    </div>
  );
}
