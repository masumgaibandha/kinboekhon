import { z } from "zod";

const amount = z.string().regex(/^\d+(\.\d+)?$/).transform(Number);
const count = z.string().regex(/^\d+$/).transform(Number);
const name = z.string().catch("").transform((value) => value.slice(0, 200));
const metaId = z.string().regex(/^\d{1,30}$/);

const insightRowSchema = z.object({
  date_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  account_currency: z.string().regex(/^[A-Z]{3}$/),
  campaign_id: metaId,
  campaign_name: name,
  adset_id: metaId,
  adset_name: name,
  ad_id: metaId,
  ad_name: name,
  spend: amount.catch(0),
  impressions: count.catch(0),
  inline_link_clicks: count.catch(0),
  actions: z.array(z.object({ action_type: z.string(), value: amount.catch(0) })).catch([]),
});

export type InsightRow = z.output<typeof insightRowSchema>;

// One page of the insights edge; `next` is the link to the page after it.
export const insightPageSchema = z.object({
  data: z.array(insightRowSchema),
  paging: z.object({ next: z.string().optional() }).optional(),
});

export const graphErrorSchema = z.object({ error: z.object({ message: z.string(), code: z.number().optional() }) });

// Meta reports the same purchases under several names; the first one found is used, never a sum.
const PURCHASE_TYPES = ["omni_purchase", "purchase", "offsite_conversion.fb_pixel_purchase"];

export function purchasesOf(row: InsightRow): number {
  for (const type of PURCHASE_TYPES) {
    const action = row.actions.find((item) => item.action_type === type);
    if (action) return Math.round(action.value);
  }
  return 0;
}
