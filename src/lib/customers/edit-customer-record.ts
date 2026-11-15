import { adminFail, type AdminActionResult } from "@/lib/admin-result";
import { CUSTOMER_TAG_LABELS } from "@/lib/customers/tags";
import { connectMongoose } from "@/lib/db";
import { CustomerModel } from "@/lib/models/Customer";
import type { CustomerTagsInput } from "@/lib/validation/customer";

const NOT_FOUND = "Customer not found.";

// Adds and removes only the tags the admin toggled, so a stale form cannot undo another change.
export async function saveCustomerTags({ phone, tags, initial }: CustomerTagsInput): Promise<AdminActionResult> {
  const added = tags.filter((tag) => !initial.includes(tag));
  const removed = initial.filter((tag) => !tags.includes(tag));
  if (added.length === 0 && removed.length === 0) return adminFail("Nothing changed.");

  await connectMongoose();
  const result = await CustomerModel.updateOne(
    { phone },
    [{ $set: { tags: { $setUnion: [{ $setDifference: [{ $ifNull: ["$tags", []] }, removed] }, added] }, updatedAt: "$$NOW" } }],
    { updatePipeline: true },
  );
  if (result.matchedCount === 0) return adminFail(NOT_FOUND);

  const parts = [
    ...added.map((tag) => `added ${CUSTOMER_TAG_LABELS[tag]}`),
    ...removed.map((tag) => `removed ${CUSTOMER_TAG_LABELS[tag]}`),
  ];
  return { ok: true, message: `Tags saved: ${parts.join(", ")}.` };
}

export async function addCustomerNote(phone: string, text: string): Promise<AdminActionResult> {
  await connectMongoose();
  const result = await CustomerModel.updateOne({ phone }, { $push: { notes: { text, at: new Date() } } });
  if (result.matchedCount === 0) return adminFail(NOT_FOUND);
  return { ok: true, message: "Note added." };
}
