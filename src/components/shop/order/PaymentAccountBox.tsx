import { CopyButton } from "@/components/shop/order/CopyButton";
import { Money } from "@/components/ui/Money";
import {
  ACCOUNT_TYPE_LABELS_BN,
  METHOD_LABELS_BN,
  SEND_HOW_BN,
  type PaymentAccount,
} from "@/lib/orders/payment-methods";

function Line({ label, value, copy }: { label: string; value: string; copy?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-sm text-desc">
        {label}
        <span className="block text-base font-semibold text-heading">{value}</span>
      </span>
      {copy && <CopyButton value={value} label={copy} />}
    </div>
  );
}

// Where to send the advance and exactly how much.
export function PaymentAccountBox({ account, amount }: { account: PaymentAccount; amount: number }) {
  const name = METHOD_LABELS_BN[account.method];

  return (
    <div className="rounded-md border border-brand bg-brand-light p-3">
      {account.method === "bank" ? (
        <>
          <p className="text-[15px] font-semibold text-body">এই ব্যাংক অ্যাকাউন্টে টাকা পাঠান:</p>
          <Line label="ব্যাংক" value={account.bankName} />
          <Line label="অ্যাকাউন্টের নাম" value={account.accountName} />
          <Line label="অ্যাকাউন্ট নম্বর" value={account.accountNumber} copy="অ্যাকাউন্ট নম্বর" />
          {account.branch && <Line label="শাখা" value={account.branch} />}
          {account.routingNumber && <Line label="রাউটিং নম্বর" value={account.routingNumber} />}
        </>
      ) : (
        <>
          <p className="text-[15px] font-semibold text-body">
            {name} অ্যাপ থেকে এই নম্বরে {SEND_HOW_BN[account.accountType]} করুন:
          </p>
          <Line
            label={`${name} ${ACCOUNT_TYPE_LABELS_BN[account.accountType]} নম্বর`}
            value={account.number}
            copy={`${name} নম্বর`}
          />
        </>
      )}
      <div className="mt-2 flex items-center justify-between gap-3 border-t border-dashed border-brand pt-2">
        <span className="text-[15px] font-semibold text-body">
          পাঠাবেন
          <span className="block text-2xl font-bold text-brand-dark">
            <Money amount={amount} bold />
          </span>
        </span>
        <CopyButton value={String(amount)} label="টাকার পরিমাণ" />
      </div>
    </div>
  );
}
