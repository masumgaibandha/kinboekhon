"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import toast from "react-hot-toast";

import { createProduct, updateProduct } from "@/app/admin/(panel)/products/actions";
import { Section, TextArea, TextField, Toggle } from "@/components/admin/form/fields";
import { ImageUploader, UPLOADING_FIELD } from "@/components/admin/products/ImageUploader";
import { LandingFields } from "@/components/admin/products/LandingFields";
import { ACTIVE_INITIAL_FIELD } from "@/lib/product-form";
import type { ProductInput } from "@/lib/validation/product";

interface ProductFormProps {
  productId?: string;
  product: ProductInput;
}

export function ProductForm({ productId, product }: ProductFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(0);
  const [savedSlug, setSavedSlug] = useState(product.slug);
  const [savedActive, setSavedActive] = useState(product.active);
  const [slug, setSlug] = useState(product.slug);
  const isEdit = Boolean(productId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (formData.has(UPLOADING_FIELD)) {
      toast.error("Wait for the image upload to finish.", { id: "product-error" });
      return;
    }
    startTransition(async () => {
      const result = productId ? await updateProduct(productId, formData) : await createProduct(formData);
      if (!result.ok) {
        setErrors(result.fieldErrors);
        toast.error(result.message, { id: "product-error" });
        return;
      }
      setErrors({});
      toast.dismiss("product-error");
      if (productId) {
        setSavedSlug(slug);
        setSavedActive(formData.get("active") === "on");
        toast.success("Product saved.");
        return;
      }
      toast.success("Product created.");
      setFormKey((key) => key + 1);
      router.push("/admin/products");
    });
  }

  const slugWarning =
    isEdit && slug.trim() !== savedSlug
      ? "Changing the slug breaks old links and Facebook ads that use the current one."
      : undefined;

  return (
    <form key={formKey} onSubmit={handleSubmit} noValidate className="space-y-4">
      {isEdit && <input type="hidden" name={ACTIVE_INITIAL_FIELD} value={String(savedActive)} />}
      <Section title="Basics">
        <TextField name="name" label="Name" defaultValue={product.name} error={errors.name} />
        <div>
          <TextField
            name="slug"
            label="Slug"
            defaultValue={product.slug}
            error={errors.slug}
            hint="Lowercase English letters, numbers and hyphens. Used in the page link."
            placeholder="vegetable-chopper"
            onChange={setSlug}
          />
          {slugWarning && (
            <p role="alert" className="mt-2 rounded-lg bg-brand-light px-3 py-2 text-sm font-medium text-brand-dark">
              {slugWarning}
            </p>
          )}
        </div>
        <TextField
          name="price"
          label="Price (taka)"
          defaultValue={product.price ? String(product.price) : ""}
          error={errors.price}
          numeric
        />
        <TextField
          name="oldPrice"
          label="Old price (taka)"
          defaultValue={product.oldPrice === null ? "" : String(product.oldPrice)}
          error={errors.oldPrice}
          hint="Optional. Must be higher than the price."
          numeric
        />
        <TextArea
          name="shortDescription"
          label="Short description"
          defaultValue={product.shortDescription}
          error={errors.shortDescription}
          rows={2}
        />
        <TextField
          name="sortOrder"
          label="Sort order"
          defaultValue={String(product.sortOrder)}
          error={errors.sortOrder}
          hint="Lower numbers show first on the home page."
          numeric
        />
        <div className="flex items-end pb-2">
          <Toggle name="active" label="Active (shown in the shop)" defaultChecked={product.active} />
        </div>
      </Section>

      <Section title="Images">
        <ImageUploader
          name="images"
          label="Gallery"
          hint="The first image is the main one. JPG, PNG, WebP or HEIC, up to 10 MB each."
          images={product.images}
          errors={errors}
          markMain
        />
      </Section>

      <LandingFields product={product} errors={errors} />

      <div className="sticky bottom-0 -mx-4 border-t border-line bg-page/95 px-4 py-3">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-brand py-3 font-semibold text-white disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {pending ? "Saving..." : isEdit ? "Save product" : "Create product"}
        </button>
      </div>
    </form>
  );
}
