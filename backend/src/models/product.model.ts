import { model, Schema, type InferSchemaType, type Types } from "mongoose";

const productMetricsSchema = new Schema(
  {
    sales30d: { type: Number, default: 0 },
    views30d: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    reorderPoint: {
      type: Number,
      default: 10,
      min: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "active",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    metrics: {
      type: productMetricsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  },
);

export type ProductDocument = InferSchemaType<typeof productSchema> & { category: Types.ObjectId };
export const ProductModel = model("Product", productSchema);
