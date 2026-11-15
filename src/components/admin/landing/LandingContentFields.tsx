import { Section, TextArea, TextField } from "@/components/admin/form/fields";
import { FaqRows } from "@/components/admin/home/FaqRows";
import { BenefitRows } from "@/components/admin/landing/BenefitRows";
import { ImageUploader } from "@/components/admin/products/ImageUploader";
import type { LandingValues } from "@/lib/validation/landing";

interface LandingContentFieldsProps {
  landing: LandingValues;
  errors: Record<string, string>;
}

const ONE_PER_LINE = "One per line.";

export function LandingContentFields({ landing, errors }: LandingContentFieldsProps) {
  const { problem, solution, benefits, gallery, howTo, inBox, specs } = landing;
  const title = (name: string, value: string, placeholder: string) => (
    <TextField name={`${name}.title`} label="Title" defaultValue={value} error={errors[`${name}.title`]} placeholder={placeholder} />
  );

  return (
    <>
      <Section title="Problem" description="Hidden when the pain points are empty.">
        {title("problem", problem.title, "আপনার কি এই সমস্যা হয়?")}
        <TextArea name="problem.points" label="Pain points" defaultValue={problem.points.join("\n")} error={errors["problem.points"]} hint={`${ONE_PER_LINE} Up to 10.`} rows={4} />
      </Section>

      <Section title="Solution" description="Hidden when the text is empty.">
        {title("solution", solution.title, "সমাধান")}
        <TextArea name="solution.text" label="Text" defaultValue={solution.text} error={errors["solution.text"]} hint="Each line becomes a paragraph." rows={4} />
      </Section>

      <Section title="Benefits" description="Each benefit gets the icon you pick. Hidden when empty.">
        {title("benefits", benefits.title, "কেন এটি নেবেন")}
        <BenefitRows items={benefits.items} errors={errors} />
      </Section>

      <Section title="Image gallery" description="Swipe gallery. Hidden when empty.">
        {title("gallery", gallery.title, "ছবিতে দেখুন")}
        <ImageUploader name="gallery.images" label="Gallery images" kind="landing" hint="JPG, PNG, WebP or HEIC, up to 10 MB each." images={gallery.images} errors={errors} />
      </Section>

      <Section title="How to use" description="Numbered steps. Hidden when empty.">
        {title("howTo", howTo.title, "কীভাবে ব্যবহার করবেন")}
        <TextArea name="howTo.steps" label="Steps" defaultValue={howTo.steps.join("\n")} error={errors["howTo.steps"]} hint={`${ONE_PER_LINE} Up to 10.`} rows={4} />
      </Section>

      <Section title="What's in the box" description="Hidden when empty.">
        {title("inBox", inBox.title, "বক্সে যা পাবেন")}
        <TextArea name="inBox.items" label="Items" defaultValue={inBox.items.join("\n")} error={errors["inBox.items"]} hint={`${ONE_PER_LINE} Up to 15.`} rows={3} />
      </Section>

      <Section title="Specs" description="Hidden when empty.">
        {title("specs", specs.title, "স্পেসিফিকেশন")}
        <TextArea
          name="specs.rows"
          label="Specs"
          defaultValue={specs.rows.map((row) => `${row.label}: ${row.value}`).join("\n")}
          error={errors["specs.rows"]}
          hint="One per line as Label: value, for example ম্যাটেরিয়াল: স্টেইনলেস স্টিল. Up to 20."
          rows={4}
        />
      </Section>

      <Section title="Guarantee" description="One line above the FAQ. Hidden when empty.">
        <TextField name="guarantee" label="Guarantee or return line" defaultValue={landing.guarantee} error={errors.guarantee} placeholder="ভাঙা বা ত্রুটিপূর্ণ হলে 3 দিনের মধ্যে রিটার্ন" />
      </Section>

      <Section title="FAQ" description="Shown in this order, above the order form.">
        <FaqRows faq={landing.faq} errors={errors} />
      </Section>
    </>
  );
}
