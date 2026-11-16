import { Section } from "@/components/admin/form/fields";
import { SingleImageField } from "@/components/admin/form/SingleImageField";
import type { ProductImage } from "@/lib/product-images";

interface ShareImageFieldProps {
  image: ProductImage | null;
  error?: string;
}

export function ShareImageField({ image, error }: ShareImageFieldProps) {
  return (
    <Section
      title="Share preview"
      description="The picture Facebook and WhatsApp show when the home page or another page without a product is shared. Product pages use the product's main image."
    >
      <div className="sm:col-span-2">
        <SingleImageField
          name="shareImage"
          label="Default share image"
          kind="share"
          image={image}
          hint="1200 x 630 works best; it is cropped to that size. Without one, the logo on orange is used."
          error={error}
          aspect="aspect-[1200/630]"
          removable
        />
      </div>
    </Section>
  );
}
