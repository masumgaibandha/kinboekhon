export function OrderButton({ label = "এখনই অর্ডার করুন" }: { label?: string }) {
  return (
    <a
      href="#order"
      className="block rounded-md bg-brand px-4 py-4 text-center text-xl font-bold text-white transition-colors hover:bg-brand-dark"
    >
      {label}
    </a>
  );
}
