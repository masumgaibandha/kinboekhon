import { MAX_QUANTITY } from "@/lib/orders/limits";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  // 0 lets the minus button take an added product off the order.
  min?: number;
  // Smaller buttons for the "এটাও নিন" rows.
  compact?: boolean;
}

export function QuantityStepper({ value, onChange, min = 1, compact = false }: QuantityStepperProps) {
  const stepButton = `flex items-center justify-center rounded-md border border-line-strong bg-card font-bold text-body disabled:opacity-40 ${
    compact ? "h-9 w-9 text-lg" : "h-11 w-11 text-xl"
  }`;

  return (
    <div className={`flex items-center ${compact ? "gap-2" : "gap-3"}`}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="পরিমাণ কমান" className={stepButton}>
        −
      </button>
      <span aria-live="polite" className={`text-center font-bold text-body ${compact ? "min-w-5 text-base" : "min-w-8 text-lg"}`}>
        {value}
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
    </div>
  );
}
