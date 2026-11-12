import { toBanglaDigits } from "@/lib/money";
import { MAX_QUANTITY } from "@/lib/orders/limits";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
}

const stepButton =
  "flex h-11 w-11 items-center justify-center rounded-md border border-line-strong bg-card text-xl font-bold text-body disabled:opacity-40";

export function QuantityStepper({ value, onChange }: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="পরিমাণ কমান" className={stepButton}>
        −
      </button>
      <span aria-live="polite" className="min-w-8 text-center text-lg font-bold text-body">
        {toBanglaDigits(value)}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QUANTITY}
        aria-label="পরিমাণ বাড়ান"
        className={stepButton}
      >
        +
      </button>
      <input type="hidden" name="quantity" value={value} />
    </div>
  );
}
