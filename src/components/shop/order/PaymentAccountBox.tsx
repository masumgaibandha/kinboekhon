import { CopyButton } from "@/components/shop/order/CopyButton";
import { Money } from "@/components/ui/Money";
import { METHOD_LABELS_BN, SEND_HOW_BN, type PaymentAccount } from "@/lib/orders/payment-methods";

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-desc">
      {label}: <span className="font-semibold text-body">{value}</span>
    </p>
  );
}

// Where to send the advance and exactly how much.
export function PaymentAccountBox({ account, amount }: { account: PaymentAccount; amount: number }) {
  const bank = account.method === "bank";
  const number = bank ? account.accountNumber : account.number;

  return (
    <div className="rounded-md border border-brand bg-brand-light p-3">
      <p className="text-[15px] font-semibold text-body">
        {bank ? "এই অ্যাকাউন্টে" : "এই নম্বরে"}{" "}
        <span className="text-brand-dark">
          <Money amount={amount} bold />
        </span>{" "}
        {bank ? "পাঠান" : `${SEND_HOW_BN[account.accountType]} করুন`}
      </p>
      {bank && (
        <div className="mt-1 space-y-0.5">
          <Detail label="ব্যাংক" value={account.bankName} />
          <Detail label="অ্যাকাউন্টের নাম" value={account.accountName} />
          {account.branch && <Detail label="শাখা" value={account.branch} />}
          {account.routingNumber && <Detail label="রাউটিং নম্বর" value={account.routingNumber} />}
        </div>
      )}
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-xl font-bold tracking-wide text-heading">{number}</span>
        <CopyButton value={number} label={bank ? "অ্যাকাউন্ট নম্বর" : `${METHOD_LABELS_BN[account.method]} নম্বর`} />
      </div>
    </div>
  );
}
