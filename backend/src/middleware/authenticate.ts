import jwt from "jsonwebtoken";

import { env } from "@/config/env";
import { UserModel } from "@/models/user.model";

import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "@/modules/auth/auth.types";

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Missing bearer token",
    });
    return;
  }

  const token = authorization.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    const user = await UserModel.findById(payload.sub).populate("role");

    if (!user || user.status !== "active") {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
      return;
    }

    const roleName =
      typeof user.role === "object" && "name" in user.role ? String(user.role.name) : payload.role;

    req.user = {
      sub: user.id,
      email: user.email,
      role: roleName,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}
