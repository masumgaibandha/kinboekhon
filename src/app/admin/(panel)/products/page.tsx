import type { Metadata } from "next";
import Link from "next/link";

import { ActiveToggle } from "@/components/admin/products/ActiveToggle";
import { ProductListThumb } from "@/components/admin/products/ProductListThumb";
import { requireAdmin } from "@/lib/admin-session";
import { listProductsForAdmin } from "@/lib/products";

export const metadata: Metadata = { title: "Products" };

export const instant = false;

export default async function ProductsPage() {
  await requireAdmin();
  const products = await listProductsForAdmin();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-heading">Products</h1>
        <Link href="/admin/products/new" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
          Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="rounded-xl border border-line bg-card p-6 text-desc">No products yet.</p>
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
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Old price</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2">
                    <ProductListThumb image={product.mainImage} />
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/admin/products/${product.id}`} className="text-heading hover:text-brand hover:underline">
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-desc">{product.slug}</td>
                  <td className="px-4 py-3">Tk {product.price}</td>
                  <td className="px-4 py-3 text-muted">{product.oldPrice ? `Tk ${product.oldPrice}` : "-"}</td>
                  <td className="px-4 py-3">{product.sortOrder}</td>
                  <td className="px-4 py-3">
                    <ActiveToggle
                      key={`${product.id}-${product.active}`}
                      id={product.id}
                      name={product.name}
                      active={product.active}
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <a
                      href={`/p/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mr-4 font-medium text-desc hover:text-brand hover:underline"
                    >
                      View
                    </a>
                    <Link href={`/admin/products/${product.id}`} className="font-medium text-brand hover:underline">
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
