export function SaveBar({ pending, label }: { pending: boolean; label: string }) {
  return (
    <div className="sticky bottom-0 -mx-4 border-t border-line bg-page/95 px-4 py-3">
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand py-3 font-semibold text-white disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {pending ? "Saving..." : label}
      </button>
    </div>
  );
}
