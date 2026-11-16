"use client";

import toast from "react-hot-toast";

import { AD_URL_PARAMS } from "@/lib/meta-ads/url-params";

export function UrlParamsBox() {
  async function copy() {
    try {
      await navigator.clipboard.writeText(AD_URL_PARAMS);
      toast.success("URL parameters copied.", { id: "ad-url-params" });
    } catch {
      toast.error("Could not copy. Select the text and copy it by hand.", { id: "ad-url-params" });
    }
  }

  return (
    <section className="rounded-xl border border-line bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-heading">Ad URL parameters</h2>
        <button type="button" onClick={copy} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
          Copy ad URL parameters
        </button>
      </div>
      <p className="mt-3 break-all rounded-lg bg-page px-3 py-2 font-mono text-xs text-desc">{AD_URL_PARAMS}</p>
      <p className="mt-2 text-xs text-muted">
        Paste it in each ad&apos;s URL parameters field in Ads Manager. Orders are matched to ads by the ad id in utm_content.
      </p>
    </section>
  );
}
