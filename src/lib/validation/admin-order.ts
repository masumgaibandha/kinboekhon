import { z } from "zod";

import { ORDER_STATUSES } from "@/lib/orders/enums";
import { DELIVERY_AREAS } from "@/lib/orders/limits";
import { ORDER_NUMBER_PATTERN, type AdminOrder } from "@/lib/orders/admin-order-detail";
import { canMoveStatus } from "@/lib/orders/status";
import { BD_MOBILE_PATTERN, normalizePhone } from "@/lib/phone";
import { LOCATION_CHECK, addLocationIssues, resolveAreaLocation, type LocationField } from "@/lib/validation/location-fields";

const RELOAD = "Reload the page and try again.";
const NAME_MESSAGE = "Enter a name, 2 to 60 characters.";
const PHONE_MESSAGE = "Enter an 11 digit mobile number, like 01712345678.";
const ADDRESS_MESSAGE = "Enter the address, 3 to 200 characters.";

const LOCATION_MESSAGES: Record<LocationField, string> = {
  cityCorporation: "Choose a city corporation.",
  divisionId: "Choose a division.",
  districtId: "Choose a district in this division.",
  upazilaId: "Choose an upazila or thana in this district.",
};

const orderNumber = z.string().regex(ORDER_NUMBER_PATTERN, "Order not found.");
const id = z.string().trim().max(20, RELOAD).default("");

export const statusChangeSchema = z
  .object({
    orderNumber,
    from: z.enum(ORDER_STATUSES, { error: RELOAD }),
    to: z.enum(ORDER_STATUSES, { error: "Choose the new status." }),
    note: z.string().trim().max(300, "Keep the note under 300 characters."),
  })
  .refine(({ from, to }) => canMoveStatus(from, to), { path: ["to"], message: "This status change is not allowed." });

export type StatusChange = z.output<typeof statusChangeSchema>;

export const adminNoteSchema = z.object({
  orderNumber,
  note: z.string().trim().max(2000, "Keep the note under 2,000 characters."),
  initial: z.string({ error: RELOAD }),
});

// The customer fields as the edit form holds them, before checking.
export const customerFieldsSchema = z.object({
  name: z.string(),
  phone: z.string(),
  address: z.string(),
  deliveryArea: z.enum(DELIVERY_AREAS),
  cityCorporation: z.string(),
  divisionId: z.string(),
  districtId: z.string(),
  upazilaId: z.string(),
});

export type CustomerFields = z.output<typeof customerFieldsSchema>;

// The edit form's starting values: only the location ids the form shows for that area are filled.
export function customerFieldsOf({ customer, deliveryArea }: Pick<AdminOrder, "customer" | "deliveryArea">): CustomerFields {
  const { location } = customer;
  const inside = location.kind === "dhaka_city";
  return {
    name: customer.name,
    phone: customer.phone,
    address: customer.address,
    deliveryArea,
    cityCorporation: inside ? (location.cityCorporation ?? "") : "",
    divisionId: inside ? "" : location.divisionId,
    districtId: inside ? "" : location.districtId,
    upazilaId: inside ? "" : (location.upazilaId ?? ""),
  };
}

export const customerEditSchema = z
  .object({
    orderNumber,
    name: z.string().trim().min(2, NAME_MESSAGE).max(60, NAME_MESSAGE),
    phone: z
      .string()
      .transform(normalizePhone)
      .refine((phone) => BD_MOBILE_PATTERN.test(phone), PHONE_MESSAGE),
    address: z.string().trim().min(3, ADDRESS_MESSAGE).max(200, ADDRESS_MESSAGE),
    deliveryArea: z.enum(DELIVERY_AREAS, { error: "Choose the delivery area." }),
    cityCorporation: id,
    divisionId: id,
    districtId: id,
    upazilaId: id,
  })
  .superRefine((fields, ctx) => addLocationIssues(fields, ctx, (field) => LOCATION_MESSAGES[field]), LOCATION_CHECK)
  .transform((fields, ctx) => {
    const result = resolveAreaLocation(fields);
    if (!result.ok) {
      ctx.addIssue({ code: "custom", path: ["deliveryArea"], message: RELOAD });
      return z.NEVER;
    }
    return { ...fields, location: result.location };
  });

export type CustomerEdit = z.output<typeof customerEditSchema>;
