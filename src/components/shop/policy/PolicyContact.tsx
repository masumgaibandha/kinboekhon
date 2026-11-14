import { PhoneIcon, WhatsAppIcon } from "@/components/shop/icons";
import { toInternationalPhone } from "@/lib/phone";
import { getSettings } from "@/lib/settings";

const linkClass =
  "inline-flex items-center gap-2 rounded-md border border-line-strong px-3 py-2 text-[15px] font-semibold text-heading hover:border-brand";

// Phone and WhatsApp from Settings; each is hidden when empty.
export async function PolicyContact() {
  const { supportPhone, whatsappNumber } = await getSettings();

  if (!supportPhone && !whatsappNumber) {
    return <p className="text-[15px] leading-relaxed text-body">আমাদের ফেসবুক পেজে মেসেজ দিন।</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {supportPhone && (
        <a href={`tel:${supportPhone}`} className={linkClass}>
          <PhoneIcon className="h-4 w-4 text-brand" />
          ফোন: {supportPhone}
        </a>
      )}
      {whatsappNumber && (
        <a
          href={`https://wa.me/${toInternationalPhone(whatsappNumber)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          <WhatsAppIcon className="h-4 w-4 text-brand" />
          WhatsApp: {whatsappNumber}
        </a>
      )}
    </div>
  );
}
