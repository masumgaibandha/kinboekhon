"use client";

import { useEffect, useRef } from "react";

import type { OrderFields } from "@/components/shop/order/use-order-submit";
import { BD_MOBILE_PATTERN, normalizePhone } from "@/lib/phone";

const storageKey = (productId: string) => `ke_draft_${productId}`;

function newKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// One key per product, kept across visits; storage can be blocked, then the key lives only on this page.
function readKey(productId: string): string {
  try {
    const saved = localStorage.getItem(storageKey(productId));
    if (saved) return saved;
    const key = newKey();
    localStorage.setItem(storageKey(productId), key);
    return key;
  } catch {
    return newKey();
  }
}

// Saves what the customer typed so far on every field blur and when the page is hidden, once the phone is valid.
export function useDraft(productId: string, readFields: () => OrderFields | null) {
  const key = useRef("");
  const lastSent = useRef("");
  const done = useRef(false);
  const read = useRef(readFields);
  const saveLatest = useRef<() => void>(() => {});

  function draftKey(): string {
    key.current ||= readKey(productId);
    return key.current;
  }

  function save() {
    const current = read.current();
    if (done.current || !current) return;
    const fields: Partial<OrderFields> = { ...current };
    // Payment proof (sender number, Transaction ID) is never part of a draft.
    delete fields.senderNumber;
    delete fields.transactionId;
    if (!BD_MOBILE_PATTERN.test(normalizePhone(fields.phone ?? ""))) return;
    const body = JSON.stringify({ ...fields, draftKey: draftKey() });
    if (body === lastSent.current) return;
    lastSent.current = body;
    fetch("/api/drafts", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {
      lastSent.current = "";
    });
  }

  // After the order: no more saves, and the next visit starts a new draft.
  function finish() {
    done.current = true;
    try {
      localStorage.removeItem(storageKey(productId));
    } catch {}
  }

  useEffect(() => {
    read.current = readFields;
    saveLatest.current = save;
  });

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") saveLatest.current();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  return { save, draftKey, finish };
}
