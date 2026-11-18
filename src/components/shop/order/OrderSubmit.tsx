import type { RefObject } from "react";

import { TrustRow } from "@/components/shop/order/TrustRow";
import { CHECK_NOT_LOADED } from "@/components/shop/order/use-order-submit";
import { Money } from "@/components/ui/Money";

interface OrderSubmitProps {
  message: string;
  // Turnstile could not load, so no order can be sent.
  checkFailed: boolean;
  turnstileRef: RefObject<HTMLDivElement | null>;
  pending: boolean;
  advance: boolean;
  total: number;
}

// The Turnstile slot (empty for most customers), the form's main error, the order button and the lines under it.
// Below 1024px the button is a bar fixed to the screen bottom while the form is on screen, and the last item of the form.
export function OrderSubmit({ message, checkFailed, turnstileRef, pending, advance, total }: OrderSubmitProps) {
  const shown = message || (checkFailed ? CHECK_NOT_LOADED : "");
  return (
    <>
      <div ref={turnstileRef} className="empty:hidden" />
      {shown && (
        <p role="alert" className="rounded-xl bg-brand-light px-4 py-3 text-center text-sm font-medium text-brand-dark">
          {shown}
        </p>
      )}
      <div className="sticky bottom-0 z-20 order-last -mx-3 border-t border-line bg-card px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] lg:static lg:order-none lg:mx-0 lg:border-0 lg:p-0 lg:shadow-none">
        <button
          type="submit"
          disabled={pending}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-lg font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? (
            "অর্ডার হচ্ছে..."
          ) : (
            <>
              অর্ডার কনফার্ম করুন
              <span aria-hidden="true">•</span>
              <Money amount={total} bold />
            </>
          )}
        </button>
      </div>
      <div className="space-y-1.5 text-center">
        <p className="text-[13px] text-desc">
          {advance ? "পেমেন্ট যাচাই করে আমরা অর্ডার কনফার্ম করব" : "অর্ডারের পর আমরা ফোন করে কনফার্ম করব"}
        </p>
        {/* New tab, so the half-filled form stays open. */}
        <p className="text-xs text-muted">
          অর্ডার করে আপনি আমাদের{" "}
          <a href="/terms" target="_blank" rel="noopener" className="text-desc underline">
            শর্তাবলী
          </a>{" "}
          ও{" "}
          <a href="/return-policy" target="_blank" rel="noopener" className="text-desc underline">
            রিটার্ন নীতি
          </a>{" "}
          মেনে নিচ্ছেন
        </p>
      </div>
      <div className="hidden lg:block">
        <TrustRow />
      </div>
    </>
  );
}
