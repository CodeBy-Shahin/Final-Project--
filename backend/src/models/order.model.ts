import { model, Schema, type InferSchemaType, type Types } from "mongoose";

const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const shippingAddressSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, trim: true },
    postalCode: { type: String, trim: true },
  },
  { _id: false },
);

const trackingEventSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      required: true,
    },
    label: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const shipmentSchema = new Schema(
  {
    carrier: { type: String, trim: true },
    trackingNumber: { type: String, trim: true },
    estimatedDelivery: { type: Date },
    currentLocation: { type: String, trim: true },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "card", "bank"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      type: shippingAddressSchema,
    },
    shipment: {
      type: shipmentSchema,
    },
    trackingEvents: {
      type: [trackingEventSchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export type OrderDocument = InferSchemaType<typeof orderSchema> & { user?: Types.ObjectId | null };
export const OrderModel = model("Order", orderSchema);
