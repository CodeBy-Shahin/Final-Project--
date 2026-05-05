import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "@/config/env";
import { AuditLogModel } from "@/models/audit-log.model";
import { UserModel } from "@/models/user.model";
import { ApiError } from "@/utils/api-error";

import type { JwtPayload } from "./auth.types";

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: "12h",
  });
}

export async function loginUser(email: string, password: string, ipAddress?: string) {
  const user = await UserModel.findOne({ email: email.toLowerCase() }).populate("role");

  if (!user) {
    await AuditLogModel.create({
      actorEmail: email.toLowerCase(),
      action: "auth.login",
      entityType: "user",
      status: "failed",
      ipAddress,
      metadata: {
        reason: "user_not_found",
      },
    });

    throw new ApiError(401, "Invalid email or password");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    await AuditLogModel.create({
      actorEmail: email.toLowerCase(),
      action: "auth.login",
      entityType: "user",
      entityId: user.id,
      status: "failed",
      ipAddress,
      metadata: {
        reason: "invalid_password",
      },
    });

    throw new ApiError(401, "Invalid email or password");
  }

  if (user.status !== "active") {
    await AuditLogModel.create({
      actor: user._id,
      actorEmail: user.email,
      action: "auth.login",
      entityType: "user",
      entityId: user.id,
      status: "failed",
      ipAddress,
      metadata: {
        reason: "account_disabled",
      },
    });

    throw new ApiError(403, "This account is disabled");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const roleName =
    typeof user.role === "object" && "name" in user.role ? String(user.role.name) : "customer";

  await AuditLogModel.create({
    actor: user._id,
    actorEmail: user.email,
    action: "auth.login",
    entityType: "user",
    entityId: user.id,
    status: "success",
    ipAddress,
  });

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: roleName,
  });

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: roleName,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
    },
  };
}

export async function getCurrentUser(userId: string) {
  const user = await UserModel.findById(userId).populate("role");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role:
      typeof user.role === "object" && "name" in user.role ? String(user.role.name) : "customer",
    status: user.status,
    lastLoginAt: user.lastLoginAt,
  };
}
