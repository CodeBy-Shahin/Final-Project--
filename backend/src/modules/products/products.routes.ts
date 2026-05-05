import { Router } from "express";

import { authenticate } from "@/middleware/authenticate";
import { authorize } from "@/middleware/authorize";

import {
  adjustStockController,
  createProductController,
  deleteProductController,
  getInventoryLogsController,
  getInventoryOverviewController,
  getProductController,
  listAllProductsController,
  listProductsController,
  updateProductController,
} from "./products.controller";

export const productsRouter = Router();

productsRouter.get("/", listProductsController);
productsRouter.get(
  "/manage/all",
  authenticate,
  authorize(["super_admin", "admin", "vendor"]),
  listAllProductsController,
);
productsRouter.post(
  "/",
  authenticate,
  authorize(["super_admin", "admin", "vendor"]),
  createProductController,
);
productsRouter.patch(
  "/:id",
  authenticate,
  authorize(["super_admin", "admin", "vendor"]),
  updateProductController,
);
productsRouter.delete(
  "/:id",
  authenticate,
  authorize(["super_admin", "admin", "vendor"]),
  deleteProductController,
);
productsRouter.get(
  "/inventory/overview",
  authenticate,
  authorize(["super_admin", "admin", "vendor"]),
  getInventoryOverviewController,
);
productsRouter.get(
  "/inventory/logs/:id",
  authenticate,
  authorize(["super_admin", "admin", "vendor"]),
  getInventoryLogsController,
);
productsRouter.patch(
  "/:id/stock",
  authenticate,
  authorize(["super_admin", "admin", "vendor"]),
  adjustStockController,
);
productsRouter.get("/:slug", getProductController);
