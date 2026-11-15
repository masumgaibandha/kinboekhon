import { CashIcon, ReturnIcon, TruckIcon, WhatsAppIcon } from "@/components/shop/icons";

// The icons stay in this order; the admin edits only the text.
const ICONS = [CashIcon, TruckIcon, ReturnIcon, WhatsAppIcon];

export function TrustBar({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 grid grid-cols-4 gap-2 rounded-xl border border-line bg-card px-2 py-3 sm:gap-4 sm:px-4">
      {items.map((text, index) => {
        const Icon = ICONS[index];
        return (
          <li
            key={index}
            className="flex flex-col items-center gap-1.5 text-center text-xs font-medium leading-snug text-body sm:flex-row sm:justify-center sm:gap-2 sm:text-left sm:text-sm"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
              <Icon className="h-5 w-5" />
            </span>
            {text}
          </li>
        );
      })}
    </ul>
  );
}
