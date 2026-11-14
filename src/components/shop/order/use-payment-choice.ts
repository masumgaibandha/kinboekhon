"use client";

import { useState } from "react";

import { PAYMENT_OPTIONS, type PaymentOption } from "@/lib/orders/enums";
import type { AdvanceMethod, PaymentAccount } from "@/lib/orders/payment-methods";
import { calculateOrder, type OrderAmounts } from "@/lib/orders/pricing";

const PAYMENT_FIELDS = ["paymentMethod", "senderNumber", "transactionId"];

interface PaymentChoiceArgs {
  price: number;
  quantity: number;
  fullAdvanceDiscount: number;
  accounts: PaymentAccount[];
  clearError: (field: string) => void;
}

// The chosen payment option and method, and the amounts of every option for the live summary.
export function usePaymentChoice({ price, quantity, fullAdvanceDiscount, accounts, clearError }: PaymentChoiceArgs) {
  const [chosen, setChosen] = useState<PaymentOption>("cod");
  const [method, setMethod] = useState<AdvanceMethod | "">("");

  const amounts = Object.fromEntries(
    PAYMENT_OPTIONS.map((item) => [item, calculateOrder(price, quantity, item, fullAdvanceDiscount)]),
  ) as Record<PaymentOption, OrderAmounts>;
  // An option with nothing to send in advance is not offered.
  const option = chosen !== "cod" && amounts[chosen].advanceAmount <= 0 ? "cod" : chosen;

  // The first enabled method is picked for the customer when they choose to pay in advance.
  function changeOption(next: PaymentOption) {
    setChosen(next);
    if (next !== "cod" && !method && accounts[0]) setMethod(accounts[0].method);
    if (next === "cod") PAYMENT_FIELDS.forEach(clearError);
  }

  function changeMethod(next: AdvanceMethod) {
    setMethod(next);
    clearError("paymentMethod");
  }

  return { option, method, amounts, changeOption, changeMethod };
}
