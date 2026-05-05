import { z } from "zod";

import { asyncHandler } from "@/utils/async-handler";
import { createVendor, getUserById, listUsers, updateUserStatus } from "./users.service";

export const listUsersController = asyncHandler(async (req, res) => {
  const roleParam = req.query.role;
  const role = typeof roleParam === "string" ? roleParam : undefined;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 30;

  const result = await listUsers({ role, page, limit });
  res.json({ success: true, data: result });
});

export const getUserController = asyncHandler(async (req, res) => {
  const user = await getUserById(String(req.params.id));
  res.json({ success: true, data: user });
});

export const updateUserStatusController = asyncHandler(async (req, res) => {
  const { status } = z
    .object({ status: z.enum(["active", "disabled"]) })
    .parse(req.body);

  const user = await updateUserStatus(String(req.params.id), status);
  res.json({ success: true, data: user });
});

export const createVendorController = asyncHandler(async (req, res) => {
  const body = z
    .object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(8),
    })
    .parse(req.body);

  const vendor = await createVendor(body);
  res.status(201).json({ success: true, data: vendor });
});
