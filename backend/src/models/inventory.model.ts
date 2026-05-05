import { model, Schema, type InferSchemaType } from "mongoose";

const inventoryLogSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    type: { type: String, enum: ["in", "out", "adjustment"], required: true },
    quantity: { type: Number, required: true },
    stockBefore: { type: Number, required: true },
    stockAfter: { type: Number, required: true },
    reason: { type: String, default: "Manual adjustment" },
    createdBy: { type: String },
  },
  { timestamps: true },
);

inventoryLogSchema.index({ product: 1, createdAt: -1 });

export type InventoryLogDocument = InferSchemaType<typeof inventoryLogSchema>;
export const InventoryLogModel = model("InventoryLog", inventoryLogSchema);
