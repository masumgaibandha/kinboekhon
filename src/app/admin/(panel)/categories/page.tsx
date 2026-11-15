import type { Metadata } from "next";
import Link from "next/link";

import { ProductListThumb } from "@/components/admin/products/ProductListThumb";
import { requireAdmin } from "@/lib/admin-session";
import { listCategoriesForAdmin } from "@/lib/categories/admin";

export const metadata: Metadata = { title: "Categories" };

export const instant = false;

export default async function CategoriesPage() {
  await requireAdmin();
  const categories = await listCategoriesForAdmin();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-heading">Categories</h1>
        <Link href="/admin/categories/new" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
          Add category
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="rounded-xl border border-line bg-card p-6 text-desc">No categories yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="w-16 px-4 py-3">
                  <span className="sr-only">Image</span>
                </th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2">
                    <ProductListThumb image={category.image} />
                  </td>
                  <td className="px-4 py-3 font-medium text-heading">{category.name}</td>
                  <td className="px-4 py-3 text-desc">{category.slug}</td>
                  <td className="px-4 py-3">{category.products}</td>
                  <td className="px-4 py-3">{category.sortOrder}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <a
                      href={`/c/${category.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mr-4 font-medium text-desc hover:text-brand hover:underline"
                    >
                      View
                    </a>
                    <Link href={`/admin/categories/${category.id}`} className="font-medium text-brand hover:underline">
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
