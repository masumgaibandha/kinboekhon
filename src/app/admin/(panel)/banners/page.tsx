import type { Metadata } from "next";
import Link from "next/link";

import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { requireAdmin } from "@/lib/admin-session";
import { listBannersForAdmin } from "@/lib/banners/admin";

export const metadata: Metadata = { title: "Banners" };

export const instant = false;

export default async function BannersPage() {
  await requireAdmin();
  const banners = await listBannersForAdmin();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-heading">Banners</h1>
        <Link href="/admin/banners/new" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
          Add banner
        </Link>
      </div>
      <p className="text-sm text-desc">The home page slider shows banners that are On, lowest sort order first.</p>

      {banners.length === 0 ? (
        <p className="rounded-xl border border-line bg-card p-6 text-desc">No banners yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="w-32 px-4 py-3">
                  <span className="sr-only">Image</span>
                </th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Link</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr key={banner.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2">
                    <div className="relative aspect-[2/1] w-24 overflow-hidden rounded-md border border-line bg-page">
                      <CloudinaryImage publicId={banner.mobileImage.publicId} alt="" fill sizes="96px" className="object-cover" />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-heading">{banner.title}</td>
                  <td className="px-4 py-3 text-desc">{banner.link || "-"}</td>
                  <td className="px-4 py-3">{banner.sortOrder}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        banner.active ? "bg-brand-light text-brand-dark" : "bg-line text-muted"
                      }`}
                    >
                      {banner.active ? "On" : "Off"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/banners/${banner.id}`} className="font-medium text-brand hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
