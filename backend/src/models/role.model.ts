import { model, Schema, type InferSchemaType } from "mongoose";

const roleSchema = new Schema(
  {
    name: {
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
    permissions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export type RoleDocument = InferSchemaType<typeof roleSchema>;
export const RoleModel = model("Role", roleSchema);
