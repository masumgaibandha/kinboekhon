import { CashIcon, PhoneIcon, ReturnIcon } from "@/components/shop/icons";

const ITEMS = [
  { icon: CashIcon, label: "ক্যাশ অন ডেলিভারি" },
  { icon: PhoneIcon, label: "ফোনে কনফার্ম" },
  { icon: ReturnIcon, label: "রিটার্ন নীতি" },
];

// Under the desktop order button.
export function TrustRow() {
  return (
    <ul className="grid grid-cols-3 gap-2 border-t border-line pt-4">
      {ITEMS.map(({ icon: Icon, label }) => (
        <li key={label} className="flex flex-col items-center gap-1.5 text-center text-xs font-medium leading-snug text-desc">
          <Icon className="size-5 text-brand" />
          {label}
        </li>
      ))}
    </ul>
  );
}
