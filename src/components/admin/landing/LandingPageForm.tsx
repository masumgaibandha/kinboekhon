"use client";

import { saveLanding } from "@/app/admin/(panel)/products/landing-actions";
import { SaveBar } from "@/components/admin/form/SaveBar";
import { Section, TextField, Toggle } from "@/components/admin/form/fields";
import { SingleImageField } from "@/components/admin/form/SingleImageField";
import { useSaveForm } from "@/components/admin/form/use-save-form";
import { LandingContentFields } from "@/components/admin/landing/LandingContentFields";
import { INITIAL_VALUES_FIELD } from "@/lib/changed-fields";
import type { LandingValues } from "@/lib/validation/landing";

interface LandingPageFormProps {
  productId: string;
  landing: LandingValues;
}

export function LandingPageForm({ productId, landing }: LandingPageFormProps) {
  const { handleSubmit, pending, errors } = useSaveForm(`landing-${productId}`, saveLanding);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name={INITIAL_VALUES_FIELD} value={JSON.stringify(landing)} />

      <Section
        title="Landing page: top"
        description="Every section is optional. Empty sections are hidden. The price, order button, trust badges and order form come from the product."
      >
        <div className="sm:col-span-2">
          <Toggle name="active" label="On (the page at /l/slug is live while the product is Active)" defaultChecked={landing.active} />
        </div>
        <TextField name="headline" label="Headline" defaultValue={landing.headline} error={errors.headline} hint="Empty: the product name." />
        <TextField name="subheadline" label="Subheadline" defaultValue={landing.subheadline} error={errors.subheadline} />
        <TextField
          name="heroVideoUrl"
          label="Hero video (optional)"
          defaultValue={landing.heroVideoUrl}
          error={errors.heroVideoUrl}
          hint="A YouTube or Facebook video link. It plays when tapped; the hero image is its cover."
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <SingleImageField
          name="heroImage"
          label="Hero image (optional)"
          kind="landing"
          image={landing.heroImage}
          hint="Square works best. Empty: the product's main image."
          error={errors.heroImage}
          removable
        />
      </Section>

      <LandingContentFields landing={landing} errors={errors} />

      <SaveBar pending={pending} label="Save landing page" />
    </form>
  );
}
