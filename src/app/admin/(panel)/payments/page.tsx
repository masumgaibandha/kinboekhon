import type { Metadata } from "next";

import { PaymentReviewCard } from "@/components/admin/payments/PaymentReviewCard";
import { requireAdmin } from "@/lib/admin-session";
import { listPaymentsToReview } from "@/lib/orders/payment-queue";

export const metadata: Metadata = { title: "Payments" };

export const instant = false;

export default async function PaymentsPage() {
  await requireAdmin();
  const payments = await listPaymentsToReview();

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold text-heading">Payments</h1>
        <p className="text-sm text-desc">
          {payments.length} waiting for review, oldest first
        </p>
      </div>
      <p className="text-sm text-desc">
        Check each Transaction ID and amount in the bKash, Nagad, Rocket or bank statement before approving.
      </p>
      {payments.length === 0 ? (
        <p className="rounded-xl border border-line bg-card p-6 text-desc">No advance payments are waiting.</p>
      ) : (
        payments.map((payment) => <PaymentReviewCard key={payment.orderNumber} payment={payment} />)
      )}
    </div>
  );
}
