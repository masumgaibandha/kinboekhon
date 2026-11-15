import { z } from "zod";

import { CUSTOMER_TAGS } from "@/lib/customers/tags";
import { BD_MOBILE_PATTERN } from "@/lib/phone";

const RELOAD = "Reload the page and try again.";

const phone = z.string().regex(BD_MOBILE_PATTERN, "Customer not found.");
const tagList = z.array(z.enum(CUSTOMER_TAGS, { error: RELOAD })).max(CUSTOMER_TAGS.length, RELOAD);

// The tags the form was loaded with come along, so only the tags the admin toggled are written.
export const customerTagsSchema = z.object({ phone, tags: tagList, initial: tagList });

export type CustomerTagsInput = z.output<typeof customerTagsSchema>;

export const customerNoteSchema = z.object({
  phone,
  text: z.string().trim().min(1, "Write the note first.").max(500, "Keep the note under 500 characters."),
});
