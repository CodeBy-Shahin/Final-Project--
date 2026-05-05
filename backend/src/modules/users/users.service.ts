import bcrypt from "bcryptjs";

import { RoleModel } from "@/models/role.model";
import { UserModel } from "@/models/user.model";
import { ApiError } from "@/utils/api-error";

function serializeUser(user: Record<string, unknown>) {
  const role = user.role as Record<string, unknown> | null;
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: role?.name ?? "customer",
    status: user.status,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

export async function listUsers(options: { role?: string; page?: number; limit?: number }) {
  const { role, page = 1, limit = 30 } = options;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (role) {
    const roleDoc = await RoleModel.findOne({ name: role });
    if (roleDoc) filter.role = roleDoc._id;
  }

  const [users, total] = await Promise.all([
    UserModel.find(filter).populate("role").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    UserModel.countDocuments(filter),
  ]);

  return { items: users.map(serializeUser), total, page, limit };
}

export async function getUserById(userId: string) {
  const user = await UserModel.findById(userId).populate("role").lean();
  if (!user) throw new ApiError(404, "User not found");
  return serializeUser(user);
}

export async function updateUserStatus(userId: string, status: "active" | "disabled") {
  const user = await UserModel.findByIdAndUpdate(userId, { status }, { new: true })
    .populate("role")
    .lean();
  if (!user) throw new ApiError(404, "User not found");
  return serializeUser(user);
}

export async function createVendor(input: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await UserModel.findOne({ email: input.email.toLowerCase() });
  if (existing) throw new ApiError(409, "Email already registered");

  const vendorRole = await RoleModel.findOneAndUpdate(
    { name: "vendor" },
    {
      $setOnInsert: {
        name: "vendor",
        description: "Vendor / seller account access",
        permissions: ["products.manage", "orders.manage:self", "catalog.read"],
      },
    },
    { upsert: true, new: true },
  );

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await UserModel.create({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash,
    role: vendorRole._id,
    status: "active",
  });

  const populated = await UserModel.findById(user._id).populate("role").lean();
  return serializeUser(populated!);
}
