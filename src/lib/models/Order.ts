import { Schema } from "mongoose";

import { appDb } from "@/lib/db";
import { HISTORY_KINDS, type OrderDocument } from "@/lib/models/order-document";
import { CAPI_STATUSES, ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_OPTIONS, PAYMENT_STATUSES } from "@/lib/orders/enums";
import { CITY_CORPORATIONS } from "@/lib/locations/dhaka";
import { DELIVERY_AREAS } from "@/lib/orders/limits";
import { TURNSTILE_RESULTS } from "@/lib/turnstile";

export { HISTORY_KINDS } from "@/lib/models/order-document";
export type { OrderDocument, OrderHistoryEntry, OrderTracking } from "@/lib/models/order-document";

const orderSchema = new Schema<OrderDocument>(
  {
    orderNumber: { type: String, required: true, unique: true },
    publicId: { type: String, required: true, unique: true },
    product: {
      productId: { type: Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      slug: { type: String, required: true },
      image: { type: String, default: null },
      price: { type: Number, required: true },
    },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
    deliveryArea: { type: String, enum: DELIVERY_AREAS, required: true },
    deliveryCharge: { type: Number, required: true },
    deliveryDiscount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      location: {
        kind: { type: String, enum: ["dhaka_city", "outside_dhaka"], required: true },
        cityCorporation: { type: String, enum: CITY_CORPORATIONS.map((item) => item.id) },
        cityCorporationName: String,
        divisionId: { type: String, required: true },
        division: { type: String, required: true },
        districtId: { type: String, required: true },
        district: { type: String, required: true },
        upazilaId: String,
        upazila: String,
        upazilaType: { type: String, enum: ["upazila", "city_thana"] },
      },
    },
    status: { type: String, enum: ORDER_STATUSES, required: true, default: "pending" },
    statusHistory: [
      {
        _id: false,
        kind: { type: String, enum: HISTORY_KINDS, default: "status" },
        status: { type: String, enum: ORDER_STATUSES },
        at: Date,
        note: String,
      },
    ],
    payment: {
      option: { type: String, enum: PAYMENT_OPTIONS, required: true },
      method: { type: String, enum: PAYMENT_METHODS, required: true },
      status: { type: String, enum: PAYMENT_STATUSES, required: true },
      advanceAmount: { type: Number, required: true, default: 0 },
      dueOnDelivery: { type: Number, required: true },
      senderNumber: String,
      transactionId: String,
      transactionIdNormalized: String,
      reviewNote: String,
      reviewedAt: Date,
    },
    adminNote: { type: String, default: "" },
    tracking: {
      ip: String,
      ipHash: String,
      userAgent: String,
      turnstile: { type: String, enum: TURNSTILE_RESULTS },
      fbp: String,
      fbc: String,
      sourceUrl: String,
      utmSource: String,
      utmCampaign: String,
    },
    capiPurchase: { status: { type: String, enum: CAPI_STATUSES }, error: String },
  },
  { timestamps: true },
);

orderSchema.index({ "customer.phone": 1, "product.productId": 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
// Orders from the same address, for the admin tracking box.
orderSchema.index({ "tracking.ipHash": 1, createdAt: -1 });
orderSchema.index({ "payment.status": 1, createdAt: 1 });
orderSchema.index(
  { "payment.transactionIdNormalized": 1 },
  { unique: true, partialFilterExpression: { "payment.transactionIdNormalized": { $type: "string" } } },
);

// Replace a model left from an earlier hot reload, so schema changes apply in development.
if (appDb.models.Order) appDb.deleteModel("Order");

export const OrderModel = appDb.model<OrderDocument>("Order", orderSchema);
