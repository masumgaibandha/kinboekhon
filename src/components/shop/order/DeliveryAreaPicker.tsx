import { Money } from "@/components/ui/Money";
import { DELIVERY_AREA_LABELS, DELIVERY_AREAS, type DeliveryArea } from "@/lib/orders/limits";

interface DeliveryAreaPickerProps {
  value: DeliveryArea;
  onChange: (area: DeliveryArea) => void;
  charges: Record<DeliveryArea, number>;
  labelClass: string;
}

export function DeliveryAreaPicker({ value, onChange, charges, labelClass }: DeliveryAreaPickerProps) {
  return (
    <fieldset>
      <legend className={labelClass}>ডেলিভারি এলাকা</legend>
      <div className="grid grid-cols-2 gap-2">
        {DELIVERY_AREAS.map((area) => (
          <label
            key={area}
            className={`flex flex-col rounded-md border p-3 text-[15px] ${
              value === area ? "border-brand bg-brand-light" : "border-line-strong bg-card"
            }`}
          >
            <span className="flex items-center gap-2 font-semibold text-body">
              <input
                type="radio"
                name="deliveryArea"
                value={area}
                checked={value === area}
                onChange={() => onChange(area)}
                className="accent-brand"
              />
              {DELIVERY_AREA_LABELS[area]}
            </span>
            <span className="mt-1 pl-6 text-sm text-desc">ডেলিভারি <Money amount={charges[area]} /></span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
