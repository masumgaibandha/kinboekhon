import { Money } from "@/components/ui/Money";

// Money that may be below zero: a loss shows with a minus sign in the error colour.
export function SignedMoney({ amount, bold = false }: { amount: number; bold?: boolean }) {
  if (amount >= 0) return <Money amount={amount} bold={bold} />;
  return (
    <span className="whitespace-nowrap text-brand-dark">
      -<Money amount={-amount} bold={bold} />
    </span>
  );
}
