import { adminFail, type AdminActionResult } from "@/lib/admin-result";
import { connectMongoose } from "@/lib/db";
import { OrderModel, type OrderDocument } from "@/lib/models/Order";
import { ORDER_NOT_FOUND } from "@/lib/orders/change-status";
import { orderItems } from "@/lib/orders/order-items";
import { dataOf, pathaoError, pathaoRequest, PathaoUnreachable } from "@/lib/pathao/client";
import { NOT_CONNECTED, pathaoConfig } from "@/lib/pathao/config";
import { guessLocation, type CourierLocation } from "@/lib/pathao/location-match";
import { parcelBody, parcelProblem, parcelWeightKg } from "@/lib/pathao/parcel";
import { parcelGrams } from "@/lib/pathao/parcel-weight";
import { statusSlug } from "@/lib/pathao/status-map";
import { queueStatusSms } from "@/lib/sms/order-sms";
import { takeOrderStock } from "@/lib/stock/order-stock";

export const ALREADY_SENT = "This order was already sent to Pathao.";

async function locationFor(order: OrderDocument): Promise<CourierLocation | null> {
  const { city, zone, area } = await guessLocation(order.customer.location, order.courierLocation);
  if (!city || !zone) return null;
  return {
    cityId: city.id,
    cityName: city.name,
    zoneId: zone.id,
    zoneName: zone.name,
    ...(area && { areaId: area.id, areaName: area.name }),
  };
}

const releaseLock = (orderNumber: string) =>
  OrderModel.updateOne({ orderNumber, "courier.state": "sending" }, { $unset: { courier: "" } });

// No clear answer: the parcel may exist at Pathao, so the order stays locked until the admin checks.
async function markUnknown(orderNumber: string, error: string): Promise<AdminActionResult> {
  await OrderModel.updateOne({ orderNumber, "courier.state": "sending" }, { $set: { "courier.state": "unknown", "courier.error": error } });
  return adminFail(`No clear answer from Pathao (${error}). Check the Pathao panel for ${orderNumber} before sending again.`);
}

async function saveSent(orderNumber: string, data: Record<string, unknown>, location: CourierLocation): Promise<AdminActionResult> {
  const consignmentId = String(data.consignment_id);
  const deliveryFee = Math.round(Number(data.delivery_fee));
  const now = new Date();
  await OrderModel.updateOne(
    { orderNumber, "courier.state": "sending" },
    {
      $set: {
        "courier.state": "sent",
        "courier.consignmentId": consignmentId,
        ...(Number.isFinite(deliveryFee) && { "courier.deliveryFee": deliveryFee }),
        "courier.status": statusSlug(String(data.order_status ?? "pending")),
        "courier.statusAt": now,
        courierLocation: location,
      },
    },
  );
  const feeText = Number.isFinite(deliveryFee) ? `, delivery fee ৳${deliveryFee}` : "";
  const shipped = await OrderModel.updateOne(
    { orderNumber, status: "confirmed" },
    {
      $set: { status: "shipped" },
      $push: { statusHistory: { kind: "status", status: "shipped", at: now, note: `Sent to Pathao: consignment ${consignmentId}${feeText}.` } },
    },
  );
  if (shipped.modifiedCount > 0) {
    await takeOrderStock(orderNumber);
    queueStatusSms(orderNumber, "shipped");
  }
  return { ok: true, message: `${orderNumber} sent to Pathao.` };
}

// Books one confirmed order with Pathao. A lock on the order makes sure it is never sent twice.
export async function sendOrderToPathao(orderNumber: string): Promise<AdminActionResult> {
  const config = pathaoConfig();
  if (!config) return adminFail(NOT_CONNECTED);
  await connectMongoose();
  const order = await OrderModel.findOne({ orderNumber }).lean<OrderDocument>();
  if (!order) return adminFail(ORDER_NOT_FOUND);
  if (order.courier) return adminFail(ALREADY_SENT);
  if (order.status !== "confirmed") return adminFail("Only confirmed orders can be sent to Pathao.");

  const weightKg = parcelWeightKg(await parcelGrams(orderItems(order)));
  const problem = parcelProblem(order, weightKg);
  if (problem) return adminFail(problem);
  const location = await locationFor(order);
  if (!location) return adminFail("Pick the Pathao city and zone first.");

  const locked = await OrderModel.updateOne(
    { orderNumber, status: "confirmed", courier: { $exists: false } },
    { $set: { courier: { provider: "pathao", state: "sending", startedAt: new Date() } } },
  );
  if (locked.modifiedCount === 0) return adminFail(ALREADY_SENT);

  try {
    const response = await pathaoRequest("/aladdin/api/v1/orders", {
      method: "POST",
      body: parcelBody(order, location, config.storeId, weightKg),
    });
    const data = dataOf(response);
    if (response.status === 200 && data.consignment_id) return await saveSent(orderNumber, data, location);
    if (response.status >= 500 || response.status === 200) return await markUnknown(orderNumber, `http_${response.status}`);
    await releaseLock(orderNumber);
    return adminFail(`Pathao refused ${orderNumber}: ${pathaoError(response)}`);
  } catch (error) {
    if (error instanceof PathaoUnreachable && error.code === "pathao_token") {
      await releaseLock(orderNumber);
      return adminFail("Could not log in to Pathao. Check the PATHAO_ variables.");
    }
    return markUnknown(orderNumber, error instanceof PathaoUnreachable ? error.code : "error");
  }
}
