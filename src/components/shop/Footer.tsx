import Image from "next/image";

import { PhoneIcon, WhatsAppIcon } from "@/components/shop/icons";
import { toInternationalPhone } from "@/lib/phone";
import { getSettings } from "@/lib/settings";

export async function Footer() {
  const { supportPhone, whatsappNumber } = await getSettings();

  return (
    <footer className="mt-8 bg-footer text-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center gap-3">
          <Image src="/brand/icon-circle.svg" alt="" width={40} height={40} className="h-10 w-10" />
          <div>
            <p className="text-lg font-bold">কিনবো এখন</p>
            <p className="text-sm text-white/70">দরকার যখন, কিনবো এখন</p>
          </div>
        </div>
        {(supportPhone || whatsappNumber) && (
          <ul className="mt-5 space-y-2 text-sm">
            {supportPhone && (
              <li>
                <a href={`tel:${supportPhone}`} className="inline-flex items-center gap-2 text-white/90 hover:text-white">
                  <PhoneIcon className="h-4 w-4" />
                  ফোন: {supportPhone}
                </a>
              </li>
            )}
            {whatsappNumber && (
              <li>
                <a
                  href={`https://wa.me/${toInternationalPhone(whatsappNumber)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white/90 hover:text-white"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  WhatsApp: {whatsappNumber}
                </a>
              </li>
            )}
          </ul>
        )}
        <p className="mt-6 border-t border-white/10 pt-4 text-xs text-white/60">
          © কিনবো এখন · kinboekhon.com
        </p>
      </div>
    </footer>
  );
}
