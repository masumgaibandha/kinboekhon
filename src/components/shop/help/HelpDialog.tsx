"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { CloseIcon, WhatsAppIcon } from "@/components/shop/icons";
import { fieldClass, labelClass } from "@/components/shop/order/OrderField";
import { CHECK_NOT_LOADED } from "@/components/shop/order/use-order-submit";
import { useTurnstile } from "@/components/shop/order/use-turnstile";

export interface HelpDialogProps {
  productId: string;
  title: string;
  text: string;
  whatsappUrl: string | null;
  onClose: () => void;
}

const TRY_AGAIN = "নম্বরটি পাঠানো যায়নি। একটু পরে আবার চেষ্টা করুন।";
const NETWORK_ERROR = "ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।";

export function HelpDialog({ productId, title, text, whatsappUrl, onClose }: HelpDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const phoneInput = useRef<HTMLInputElement>(null);
  const sending = useRef(false);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const { ref: turnstileRef, getToken, reset } = useTurnstile("callback");

  // A modal dialog: focus stays inside and Escape closes it. The phone field gets focus, not the close button.
  useEffect(() => {
    dialog.current?.showModal();
    phoneInput.current?.focus();
  }, []);

  async function send(phone: string): Promise<boolean> {
    const turnstileToken = await getToken();
    if (!turnstileToken) {
      setMessage(CHECK_NOT_LOADED);
      return false;
    }
    try {
      const response = await fetch("/api/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, phone, turnstileToken }),
      });
      if (response.ok) return true;
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      setMessage(data.message ?? TRY_AGAIN);
    } catch {
      setMessage(NETWORK_ERROR);
    }
    return false;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    sending.current = true;
    setPending(true);
    setMessage("");
    const phone = String(new FormData(event.currentTarget).get("phone") ?? "");
    if (await send(phone)) {
      setSent(true);
      return;
    }
    reset();
    sending.current = false;
    setPending(false);
  }

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="help-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl bg-card text-body shadow-xl backdrop:bg-heading/60"
    >
      <div className="relative p-6">
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          aria-label="বন্ধ করুন"
          className="absolute top-3 right-3 rounded-full p-1.5 text-muted hover:bg-page hover:text-heading"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
        <h2 id="help-title" className="pr-8 text-xl font-bold text-heading">
          {title}
        </h2>
        <p className="mt-2 text-desc">{text}</p>

        {sent ? (
          <p role="status" className="mt-5 rounded-md bg-brand-light p-4 font-semibold text-brand-dark">
            ধন্যবাদ! আমরা শীঘ্রই আপনাকে কল করবো।
          </p>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-3">
            <div>
              <label htmlFor="help-phone" className={labelClass}>
                মোবাইল নম্বর
              </label>
              <input
                ref={phoneInput}
                id="help-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="01XXXXXXXXX"
                className={fieldClass}
                aria-invalid={message ? true : undefined}
                aria-describedby={message ? "help-error" : undefined}
              />
              {message && (
                <p id="help-error" className="mt-1.5 text-sm font-medium text-brand-dark">
                  {message}
                </p>
              )}
            </div>
            <div ref={turnstileRef} />
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-brand py-3 text-lg font-bold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {pending ? "পাঠানো হচ্ছে..." : "কল করুন"}
            </button>
          </form>
        )}

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 font-semibold text-brand-dark hover:text-brand"
          >
            <WhatsAppIcon className="h-5 w-5" />
            WhatsApp এ মেসেজ করুন
          </a>
        )}
      </div>
    </dialog>
  );
}
