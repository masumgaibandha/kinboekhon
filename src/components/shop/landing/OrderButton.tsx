export function OrderButton({ label = "এখনই অর্ডার করুন", soldOut = false }: { label?: string; soldOut?: boolean }) {
  if (soldOut) {
    return <p className="rounded-md bg-line-strong px-4 py-4 text-center text-xl font-bold text-desc">স্টক শেষ</p>;
  }
  return (
    <a
      href="#order"
      className="block rounded-md bg-brand px-4 py-4 text-center text-xl font-bold text-white transition-colors hover:bg-brand-dark"
    >
      {label}
    </a>
  );
}
