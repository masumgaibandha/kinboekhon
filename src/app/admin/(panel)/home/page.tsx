import type { Metadata } from "next";
import Link from "next/link";

import { HomeContentForm } from "@/components/admin/home/HomeContentForm";
import { requireAdmin } from "@/lib/admin-session";
import { getHomeContentForAdmin } from "@/lib/home/home-content";

export const metadata: Metadata = { title: "Home page" };

export const instant = false;

export default async function HomeContentPage() {
  await requireAdmin();
  const { content, version } = await getHomeContentForAdmin();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-heading">Home page</h1>
      <p className="text-sm text-desc">
        Banners and categories have their own pages:{" "}
        <Link href="/admin/banners" className="font-medium text-brand hover:underline">
          Banners
        </Link>
        ,{" "}
        <Link href="/admin/categories" className="font-medium text-brand hover:underline">
          Categories
        </Link>
        . Popular products are picked with the Popular box on each product.
      </p>
      {/* Keyed on the saved version, so a page restored from navigation history shows fresh values. */}
      <HomeContentForm key={version} content={content} />
    </div>
  );
}
