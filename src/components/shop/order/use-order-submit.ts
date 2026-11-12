"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import type { PaymentOption } from "@/lib/orders/enums";
import type { DeliveryArea } from "@/lib/orders/limits";

export interface OrderFields {
  productId: string;
  quantity: number;
  deliveryArea: DeliveryArea;
  name: string;
  phone: string;
  cityCorporation: string;
  divisionId: string;
  districtId: string;
  upazilaId: string;
  address: string;
  paymentOption: PaymentOption;
  paymentMethod: string;
  senderNumber: string;
  transactionId: string;
  draftKey: string;
}

interface OrderResponse {
  publicId?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

interface Verification {
  getToken: () => Promise<string>;
  reset: () => void;
}

const NETWORK_ERROR = "ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।";
const TRY_AGAIN = "অর্ডার নেওয়া যায়নি। একটু পরে আবার চেষ্টা করুন।";
export const CHECK_NOT_LOADED = "নিরাপত্তা যাচাই লোড হয়নি। পেজটি আবার লোড করে চেষ্টা করুন।";

export function useOrderSubmit() {
  const router = useRouter();
  const sending = useRef(false);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  async function send(fields: OrderFields, turnstileToken: string, onPlaced: () => void): Promise<boolean> {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, turnstileToken }),
      });
      const data = (await response.json().catch(() => ({}))) as OrderResponse;
      if (response.ok && data.publicId) {
        onPlaced();
        router.push(`/thank-you/${data.publicId}`);
        return true;
      }
      setErrors(data.fieldErrors ?? {});
      setMessage(data.message ?? TRY_AGAIN);
    } catch {
      setMessage(NETWORK_ERROR);
    }
    return false;
  }

  async function submit(fields: OrderFields, verification: Verification, onPlaced: () => void) {
    // A ref, not state, so a fast double tap cannot send two orders.
    if (sending.current) return;
    sending.current = true;
    setPending(true);
    setMessage("");

    const token = await verification.getToken();
    let placed = false;
    if (token) placed = await send(fields, token, onPlaced);
    else setMessage(CHECK_NOT_LOADED);
    if (placed) return;
    verification.reset();
    sending.current = false;
    setPending(false);
  }

  function clearError(field: string) {
    setErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  return { submit, pending, errors, message, clearError };
}
