"use client";

import { useRouter } from "next/navigation";

import { createCategory, updateCategory } from "@/app/admin/(panel)/categories/actions";
import { SaveBar } from "@/components/admin/form/SaveBar";
import { Section, TextField } from "@/components/admin/form/fields";
import { SingleImageField } from "@/components/admin/form/SingleImageField";
import { useSaveForm } from "@/components/admin/form/use-save-form";
import type { ShopCategory } from "@/lib/categories/shop";

interface CategoryFormProps {
  category: Omit<ShopCategory, "id"> & { sortOrder: number };
  id?: string;
}

export function CategoryForm({ category, id }: CategoryFormProps) {
  const router = useRouter();
  const { handleSubmit, pending, errors } = useSaveForm(
    id ? `category-${id}` : "category-new",
    id ? updateCategory : createCategory,
    id ? undefined : () => router.push("/admin/categories"),
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {id && <input type="hidden" name="id" value={id} />}
      <Section title="Category">
        <TextField name="name" label="Name (Bangla)" defaultValue={category.name} error={errors.name} placeholder="রান্নাঘরের পণ্য" />
        <TextField
          name="slug"
          label="Slug"
          defaultValue={category.slug}
          error={errors.slug}
          hint={id ? "Used in the page link /c/slug. Changing it breaks old links." : "Used in the page link /c/slug."}
          placeholder="kitchen"
        />
        <TextField
          name="sortOrder"
          label="Sort order"
          defaultValue={String(category.sortOrder)}
          error={errors.sortOrder}
          hint="Lower numbers show first."
          numeric
        />
        <div className="sm:col-span-2">
          <SingleImageField
            name="image"
            label="Image"
            kind="categories"
            image={category.image}
            hint="Square, at least 300 x 300 px. Shown in the home page category grid."
            error={errors.image}
            removable
          />
        </div>
      </Section>
      <SaveBar pending={pending} label={id ? "Save category" : "Create category"} />
    </form>
  );
}
