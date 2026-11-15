import { adminFail, type AdminActionResult } from "@/lib/admin-result";
import { connectMongoose } from "@/lib/db";
import { OrderModel, type OrderDocument } from "@/lib/models/Order";
import { ORDER_NOT_FOUND } from "@/lib/orders/change-status";
import { rememberLocation, type CourierLocation } from "@/lib/pathao/location-match";
import { getPathaoAreas, getPathaoCities, getPathaoZones } from "@/lib/pathao/places";
import { ALREADY_SENT } from "@/lib/pathao/send-order";

interface PickedPlace {
  cityId: number;
  zoneId: number;
  areaId: number | null;
}

// The picked ids must be in Pathao's lists, the zone inside the city and the area inside the zone.
async function placeNames({ cityId, zoneId, areaId }: PickedPlace): Promise<CourierLocation | string> {
  const city = (await getPathaoCities()).find((item) => item.id === cityId);
  if (!city) return "Pick a city from the list.";
  const zone = (await getPathaoZones(cityId)).find((item) => item.id === zoneId);
  if (!zone) return "Pick a zone of this city.";
  const area = areaId === null ? null : (await getPathaoAreas(zoneId)).find((item) => item.id === areaId);
  if (area === undefined) return "Pick an area of this zone.";
  return {
    cityId,
    cityName: city.name,
    zoneId,
    zoneName: zone.name,
    ...(area && { areaId: area.id, areaName: area.name }),
  };
}

// Saves the Pathao place on an order not sent yet, and remembers it for later orders from the same place.
export async function saveCourierLocation(orderNumber: string, picked: PickedPlace): Promise<AdminActionResult> {
  await connectMongoose();
  const order = await OrderModel.findOne({ orderNumber }, { status: 1, courier: 1, "customer.location": 1 }).lean<
    Pick<OrderDocument, "status" | "courier" | "customer">
  >();
  if (!order) return adminFail(ORDER_NOT_FOUND);
  if (order.courier) return adminFail(ALREADY_SENT);
  if (order.status !== "pending" && order.status !== "confirmed") return adminFail("Only pending or confirmed orders can change it.");

  const location = await placeNames(picked);
  if (typeof location === "string") return adminFail(location);
  const updated = await OrderModel.updateOne(
    { orderNumber, courier: { $exists: false } },
    { $set: { courierLocation: location } },
  );
  if (updated.matchedCount === 0) return adminFail(ALREADY_SENT);
  await rememberLocation(order.customer.location, location);
  return { ok: true, message: "Pathao location saved." };
}
