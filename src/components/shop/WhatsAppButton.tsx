import { WhatsAppIcon } from "@/components/shop/icons";
import { toInternationalPhone } from "@/lib/phone";
import { getSettings } from "@/lib/settings";

// Floating chat button; hidden when Settings has no WhatsApp number.
export async function WhatsAppButton() {
  const { whatsappNumber } = await getSettings();
  if (!whatsappNumber) return null;

  return (
    <a
      href={`https://wa.me/${toInternationalPhone(whatsappNumber)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp এ মেসেজ করুন"
      className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg ring-4 ring-white/60 transition-colors hover:bg-brand-dark"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
