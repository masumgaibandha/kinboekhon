import type { Metadata } from "next";

import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { requireAdmin } from "@/lib/admin-session";

export const metadata: Metadata = { title: "Add category" };

export const instant = false;

export default async function NewCategoryPage() {
  await requireAdmin();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-heading">Add category</h1>
      <CategoryForm category={{ name: "", slug: "", image: null, sortOrder: 0 }} />
    </div>
  );
}
