import type { NextRequest } from "next/server";

export interface AdTracking {
  fbp?: string;
  fbc?: string;
  sourceUrl: string;
  utmSource?: string;
  utmCampaign?: string;
}

const MAX_COOKIE = 500;

// The page that sent the request; the browser sends it as Referer on same-origin fetches.
function sourcePage(request: NextRequest): URL {
  const origin = request.nextUrl.origin;
  try {
    const page = new URL(request.headers.get("referer") ?? "");
    if (page.origin === origin) return page;
  } catch {}
  return new URL(`${origin}/`);
}

function shortValue(value: string | null | undefined, max: number): string | undefined {
  return value && value.length <= max ? value : undefined;
}

// Facebook cookies and ad source; without an _fbc cookie, a fbclid in the page URL builds one.
export function adTracking(request: NextRequest): AdTracking {
  const page = sourcePage(request);
  const fbclid = shortValue(page.searchParams.get("fbclid"), MAX_COOKIE - 30);
  return {
    fbp: shortValue(request.cookies.get("_fbp")?.value, MAX_COOKIE),
    fbc: shortValue(request.cookies.get("_fbc")?.value, MAX_COOKIE) ?? (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined),
    sourceUrl: page.href.slice(0, 1000),
    utmSource: shortValue(page.searchParams.get("utm_source"), 100),
    utmCampaign: shortValue(page.searchParams.get("utm_campaign"), 200),
  };
}
