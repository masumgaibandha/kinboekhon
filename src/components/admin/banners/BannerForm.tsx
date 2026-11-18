"use client";

import { useRouter } from "next/navigation";

import { createBanner, updateBanner } from "@/app/admin/(panel)/banners/actions";
import { SaveBar } from "@/components/admin/form/SaveBar";
import { Section, TextField, Toggle } from "@/components/admin/form/fields";
import { SingleImageField } from "@/components/admin/form/SingleImageField";
import { useSaveForm } from "@/components/admin/form/use-save-form";
import { INITIAL_VALUES_FIELD } from "@/lib/changed-fields";
import type { ProductImage } from "@/lib/product-images";
import type { BannerValues } from "@/lib/validation/banner";

type BannerStart = Omit<BannerValues, "mobileImage" | "desktopImage"> & {
  mobileImage: ProductImage | null;
  desktopImage: ProductImage | null;
};

interface BannerFormProps {
  banner: BannerStart;
  id?: string;
}

export function BannerForm({ banner, id }: BannerFormProps) {
  const router = useRouter();
  const { handleSubmit, pending, errors } = useSaveForm(
    id ? `banner-${id}` : "banner-new",
    id ? updateBanner : createBanner,
    id ? undefined : () => router.push("/admin/banners"),
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {id && <input type="hidden" name="id" value={id} />}
      {id && <input type="hidden" name={INITIAL_VALUES_FIELD} value={JSON.stringify(banner)} />}
      <Section title="Banner">
        <TextField
          name="title"
          label="Title"
          defaultValue={banner.title}
          error={errors.title}
          hint="Describes the banner for screen readers (Bangla). Not shown on the image."
        />
        <TextField
          name="link"
          label="Link"
          defaultValue={banner.link}
          error={errors.link}
          hint="A page like /p/vegetable-chopper or /c/kitchen, or a full https:// link. Empty: no link."
        />
        <TextField
          name="sortOrder"
          label="Sort order"
          defaultValue={String(banner.sortOrder)}
          error={errors.sortOrder}
          hint="Lower numbers show first."
          numeric
        />
        <div className="flex items-end pb-2">
          <Toggle name="active" label="On (shown on the home page)" defaultChecked={banner.active} />
        </div>
        <SingleImageField
          name="mobileImage"
          label="Mobile image"
          kind="banners"
          image={banner.mobileImage}
          hint="1536 x 720 px (32:15). Shown on phones below 768 px."
          error={errors.mobileImage}
          aspect="aspect-[32/15]"
        />
        <SingleImageField
          name="desktopImage"
          label="Desktop image"
          kind="banners"
          image={banner.desktopImage}
          hint="1536 x 720 px (32:15). Shown from 768 px wide screens."
          error={errors.desktopImage}
          aspect="aspect-[32/15]"
        />
      </Section>
      <SaveBar pending={pending} label={id ? "Save banner" : "Create banner"} />
    </form>
  );
}
