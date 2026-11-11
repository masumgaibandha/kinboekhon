import { Section, TextArea, TextField } from "@/components/admin/form/fields";
import { ReviewRows } from "@/components/admin/products/ReviewRows";
import type { ProductInput } from "@/lib/validation/product";

interface LandingFieldsProps {
  product: ProductInput;
  errors: Record<string, string>;
}

const ONE_PER_LINE = "One per line, up to 10.";

export function LandingFields({ product, errors }: LandingFieldsProps) {
  const { hook, problem, story, solution, proof, cta } = product;

  return (
    <>
      <Section title="Hook" description="First screen of the landing page. Empty sections are hidden.">
        <TextField name="hook.headline" label="Headline" defaultValue={hook.headline} error={errors["hook.headline"]} />
        <TextField name="hook.subheadline" label="Subheadline" defaultValue={hook.subheadline} error={errors["hook.subheadline"]} />
      </Section>

      <Section title="Problem">
        <TextField name="problem.title" label="Title" defaultValue={problem.title} error={errors["problem.title"]} />
        <TextArea name="problem.points" label="Pain points" defaultValue={problem.points.join("\n")} error={errors["problem.points"]} hint={ONE_PER_LINE} rows={4} />
      </Section>

      <Section title="Story">
        <TextField name="story.title" label="Title" defaultValue={story.title} error={errors["story.title"]} />
        <TextArea name="story.body" label="Story" defaultValue={story.body} error={errors["story.body"]} rows={5} />
      </Section>

      <Section title="Solution">
        <TextField name="solution.title" label="Title" defaultValue={solution.title} error={errors["solution.title"]} />
        <TextArea name="solution.benefits" label="Benefits" defaultValue={solution.benefits.join("\n")} error={errors["solution.benefits"]} hint={ONE_PER_LINE} rows={4} />
      </Section>

      <Section title="Proof">
        <TextField name="proof.title" label="Title" defaultValue={proof.title} error={errors["proof.title"]} />
        <ReviewRows reviews={proof.reviews} errors={errors} />
      </Section>

      <Section title="Call to action" description="Final push above the order form.">
        <TextField name="cta.title" label="Title" defaultValue={cta.title} error={errors["cta.title"]} />
        <TextField name="cta.text" label="Text" defaultValue={cta.text} error={errors["cta.text"]} />
      </Section>
    </>
  );
}
