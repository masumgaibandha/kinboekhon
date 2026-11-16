import { ExitHelpPopup } from "@/components/shop/help/ExitHelpPopup";
import { toInternationalPhone } from "@/lib/phone";
import { getSettings } from "@/lib/settings";

// Exit-intent help popup for product and landing pages; off from Settings.
export async function HelpPopup({ productId }: { productId: string }) {
  const { helpPopup, whatsappNumber } = await getSettings();
  if (!helpPopup.enabled) return null;

  return (
    <ExitHelpPopup
      productId={productId}
      title={helpPopup.title}
      text={helpPopup.text}
      whatsappUrl={whatsappNumber ? `https://wa.me/${toInternationalPhone(whatsappNumber)}` : null}
    />
  );
}
