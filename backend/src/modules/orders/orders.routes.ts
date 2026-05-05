import { Router } from "express";

import { authenticate } from "@/middleware/authenticate";
import { authorize } from "@/middleware/authorize";

import {
  createOrderController,
  getOrderController,
  listOrdersController,
  updateOrderStatusController,
} from "./orders.controller";

export const ordersRouter = Router();

ordersRouter.use(authenticate);

ordersRouter.post(
  "/",
  authorize(["customer", "super_admin", "admin"]),
  createOrderController,
);

ordersRouter.get(
  "/",
  authorize(["customer", "super_admin", "admin", "vendor"]),
  listOrdersController,
);

ordersRouter.get(
  "/:id",
  authorize(["customer", "super_admin", "admin", "vendor"]),
  getOrderController,
);

ordersRouter.patch(
  "/:id/status",
  authorize(["super_admin", "admin", "vendor"]),
  updateOrderStatusController,
);
