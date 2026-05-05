import { z } from "zod";

import { UserModel } from "@/models/user.model";
import { asyncHandler } from "@/utils/async-handler";
import { createOrder, getOrderById, listOrders, updateOrderStatus } from "./orders.service";

const addressSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  district: z.string().optional(),
  postalCode: z.string().optional(),
});

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1),
    }),
  ).min(1),
  shippingAddress: addressSchema,
  paymentMethod: z.enum(["cod", "card", "bank"]).optional(),
  notes: z.string().optional(),
});

export const createOrderController = asyncHandler(async (req, res) => {
  const body = createOrderSchema.parse(req.body);
  const user = req.user!;

  const dbUser = await UserModel.findById(user.sub).lean();
  const customerName = dbUser?.name ?? user.email.split("@")[0];

  const order = await createOrder({
    userId: user.sub,
    customerName,
    customerEmail: user.email,
    ...body,
  });

  res.status(201).json({ success: true, data: order });
});

export const listOrdersController = asyncHandler(async (req, res) => {
  const user = req.user!;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const result = await listOrders({
    userId: user.sub,
    role: user.role,
    page,
    limit,
  });

  res.json({ success: true, data: result });
});

export const getOrderController = asyncHandler(async (req, res) => {
  const user = req.user!;
  const id = String(req.params.id);
  const order = await getOrderById(id, {
    userId: user.sub,
    role: user.role,
  });

  res.json({ success: true, data: order });
});

export const updateOrderStatusController = asyncHandler(async (req, res) => {
  const user = req.user!;
  const id = String(req.params.id);
  const { status } = z.object({ status: z.string() }).parse(req.body);

  const order = await updateOrderStatus(id, status, { role: user.role });
  res.json({ success: true, data: order });
});
