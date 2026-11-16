"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import toast from "react-hot-toast";

import { AD_URL_PARAMS } from "@/lib/meta-ads/url-params";


const subscribe = () => () => {};

interface LandingLinkCardProps {
  slug: string;
  // The landing is shown only while the product and the landing are both active.
  live: boolean;
  // Shown on the product page, which links to the landing page editor.
  editHref?: string;
}

export function LandingLinkCard({ slug, live, editHref }: LandingLinkCardProps) {
  // The admin runs on the shop's own domain, so its origin is the link's origin.
  const origin = useSyncExternalStore(subscribe, () => window.location.origin, () => "");
  const plain = `${origin}/l/${slug}`;
  const adLink = `${plain}?${AD_URL_PARAMS}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(adLink);
      toast.success("Landing link copied.", { id: "landing-link" });
    } catch {
      toast.error("Could not copy. Select the link and copy it by hand.", { id: "landing-link" });
    }
  }

  return (
    <section className="rounded-xl border border-line bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-heading">Ad landing page</h2>
          <p className="mt-1 text-sm text-desc">
            {live ? "Live at " : "Not live. Turn the landing page On and keep the product Active. Link: "}
            <span className="font-mono text-xs">/l/{slug}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {editHref && (
            <Link href={editHref} className="rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-light">
              Edit landing page
            </Link>
          )}
          {live && (
            <a
              href={plain}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-line-strong px-4 py-2 text-sm font-medium text-desc hover:text-brand"
            >
              View
            </a>
          )}
          <button type="button" onClick={copy} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
            Copy landing link
          </button>
        </div>
      </div>
      <p className="mt-3 break-all rounded-lg bg-page px-3 py-2 font-mono text-xs text-desc">{adLink}</p>
      <p className="mt-2 text-xs text-muted">
        Paste it as the ad&apos;s website URL. The UTM values are saved on each order and shown in its Tracking card.
      </p>
    </section>
  );
}
