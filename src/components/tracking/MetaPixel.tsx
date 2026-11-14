import Script from "next/script";
import { Suspense } from "react";

import { PixelPageViews } from "@/components/tracking/PixelPageViews";
import { PIXEL_READY_EVENT } from "@/components/tracking/pixel";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

// Meta's base snippet, for shop pages only; it sends the first PageView. Its own pushState tracking is off, PixelPageViews sends the rest.
export function MetaPixel() {
  if (!/^\d+$/.test(PIXEL_ID)) return null;
  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq.disablePushState = true;
fbq.allowDuplicatePageViews = true;
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');
window.dispatchEvent(new Event('${PIXEL_READY_EVENT}'));`}
      </Script>
      <Suspense fallback={null}>
        <PixelPageViews />
      </Suspense>
    </>
  );
}
