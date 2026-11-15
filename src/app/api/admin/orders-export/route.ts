import { requireAdminApi } from "@/lib/admin-session";
import { dhakaDay } from "@/lib/dates";
import { ordersCsv } from "@/lib/orders/orders-csv";
import { readOrderFilters } from "@/lib/validation/order-filters";

// CSV of the orders that match the orders list filters.
export async function GET(request: Request): Promise<Response> {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const filters = readOrderFilters(Object.fromEntries(new URL(request.url).searchParams));
  const csv = await ordersCsv(filters);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${dhakaDay(new Date())}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
