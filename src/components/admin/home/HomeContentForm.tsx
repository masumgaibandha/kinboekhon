"use client";

import { saveHomeContent } from "@/app/admin/(panel)/home/actions";
import { SaveBar } from "@/components/admin/form/SaveBar";
import { Section, TextArea, TextField } from "@/components/admin/form/fields";
import { SingleImageField } from "@/components/admin/form/SingleImageField";
import { useSaveForm } from "@/components/admin/form/use-save-form";
import { FaqRows } from "@/components/admin/home/FaqRows";
import type { HomeContentValues } from "@/lib/validation/home-content";

const TRUST_LABELS = ["Cash on delivery icon", "Delivery truck icon", "Return icon", "WhatsApp icon"];

export function HomeContentForm({ content }: { content: HomeContentValues }) {
  const { handleSubmit, pending, errors } = useSaveForm("home-content", saveHomeContent);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Section title="Trust bar" description="Four short lines under the banner slider, in Bangla. Each icon is fixed.">
        {content.trust.map((text, index) => (
          <TextField key={index} name={`trust.${index}`} label={TRUST_LABELS[index]} defaultValue={text} error={errors[`trust.${index}`]} />
        ))}
      </Section>

      <Section title="Why buy from us" description="The block near the end of the home page. Empty text hides it.">
        <TextField name="why.title" label="Title" defaultValue={content.why.title} error={errors["why.title"]} />
        <TextField
          name="why.founderName"
          label="Founder name"
          defaultValue={content.why.founderName}
          error={errors["why.founderName"]}
          hint="Shown under the photo. Optional."
        />
        <TextArea
          name="why.body"
          label="Text"
          defaultValue={content.why.body}
          error={errors["why.body"]}
          hint="Each line becomes a paragraph."
          rows={5}
        />
        <SingleImageField
          name="why.founderPhoto"
          label="Founder photo (optional)"
          kind="home"
          image={content.why.founderPhoto}
          hint="Square, at least 400 x 400 px."
          error={errors["why.founderPhoto"]}
          removable
        />
      </Section>

      <Section title="FAQ" description="Questions and answers in Bangla, shown in this order.">
        <FaqRows faq={content.faq} errors={errors} />
      </Section>

      <SaveBar pending={pending} label="Save home page" />
    </form>
  );
}
