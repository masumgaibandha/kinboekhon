import { Schema, type Types } from "mongoose";

import { appDb } from "@/lib/db";
import {
  CAPI_STATUSES,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_OPTIONS,
  PAYMENT_STATUSES,
  type OrderStatus,
  type PaymentMethod,
  type PaymentOption,
  type PaymentStatus,
} from "@/lib/orders/enums";
import { CITY_CORPORATIONS } from "@/lib/locations/dhaka";
import type { OrderLocation } from "@/lib/locations/types";
import { DELIVERY_AREAS, type DeliveryArea } from "@/lib/orders/limits";

export interface OrderDocument {
  orderNumber: string;
  publicId: string;
  product: { productId: Types.ObjectId; name: string; slug: string; image: string | null; price: number };
  quantity: number;
  subtotal: number;
  deliveryArea: DeliveryArea;
  deliveryCharge: number;
  deliveryDiscount: number;
  total: number;
  customer: { name: string; phone: string; address: string; location: OrderLocation };
  status: OrderStatus;
  statusHistory: { status: OrderStatus; at: Date; note: string }[];
  payment: {
    option: PaymentOption;
    method: PaymentMethod;
    status: PaymentStatus;
    advanceAmount: number;
    dueOnDelivery: number;
    senderNumber?: string;
    transactionId?: string;
    transactionIdNormalized?: string;
    reviewNote?: string;
    reviewedAt?: Date;
  };
  adminNote: string;
  tracking?: {
    ip?: string;
    userAgent?: string;
    fbp?: string;
    fbc?: string;
    sourceUrl?: string;
    utmSource?: string;
    utmCampaign?: string;
  };
  capiPurchase?: { status: (typeof CAPI_STATUSES)[number]; error?: string };
  createdAt: Date;
  updatedAt: Date;
}

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
    statusHistory: [{ _id: false, status: { type: String, enum: ORDER_STATUSES }, at: Date, note: String }],
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
      userAgent: String,
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
orderSchema.index({ "payment.status": 1, createdAt: 1 });
orderSchema.index(
  { "payment.transactionIdNormalized": 1 },
  { unique: true, partialFilterExpression: { "payment.transactionIdNormalized": { $type: "string" } } },
);

// Replace a model left from an earlier hot reload, so schema changes apply in development.
if (appDb.models.Order) appDb.deleteModel("Order");

export const OrderModel = appDb.model<OrderDocument>("Order", orderSchema);
