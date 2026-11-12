interface OrderSubmitProps {
  message: string;
  pending: boolean;
  advance: boolean;
}

// The form's main error, the order button and the line under it.
export function OrderSubmit({ message, pending, advance }: OrderSubmitProps) {
  return (
    <>
      {message && (
        <p role="alert" className="rounded-md bg-brand-light px-3 py-2 text-center text-sm font-medium text-brand-dark">
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brand py-4 text-xl font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "অর্ডার হচ্ছে..." : "অর্ডার কনফার্ম করুন"}
      </button>
      <p className="text-center text-[13px] text-desc">
        {advance ? "পেমেন্ট যাচাই করে আমরা অর্ডার কনফার্ম করব" : "অর্ডারের পর আমরা ফোন করে কনফার্ম করব"}
      </p>
    </>
  );
}
