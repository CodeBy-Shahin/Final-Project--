import { z } from "zod";

import { asyncHandler } from "@/utils/async-handler";

import {
  adjustStock,
  createProduct,
  deleteProduct,
  getInventoryLogs,
  getInventoryOverview,
  getProductBySlug,
  getProductFilters,
  getProducts,
  listAllProducts,
  updateProduct,
} from "./products.service";

const listQuerySchema = z.object({
  featured: z.enum(["true", "false"]).optional(),
  limit: z.coerce.number().optional(),
});

export const listProductsController = asyncHandler(async (req, res) => {
  const { featured, limit } = listQuerySchema.parse(req.query);
  const items = await getProducts({
    featured: featured === "true",
    limit,
  });

  res.json({
    success: true,
    data: {
      items,
      total: items.length,
      filters: await getProductFilters(),
    },
  });
});

export const getProductController = asyncHandler(async (req, res) => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const product = await getProductBySlug(slug);

  if (!product) {
    res.status(404).json({
      success: false,
      message: "Product not found",
    });
    return;
  }

  res.json({
    success: true,
    data: product,
  });
});

const productInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  categoryId: z.string().min(1),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  status: z.enum(["active", "draft", "archived"]).optional(),
});

export const listAllProductsController = asyncHandler(async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 30;

  const result = await listAllProducts({ status, page, limit });
  res.json({ success: true, data: result });
});

export const createProductController = asyncHandler(async (req, res) => {
  const body = productInputSchema.parse(req.body);
  const product = await createProduct(body, req.user!.sub);
  res.status(201).json({ success: true, data: product });
});

export const updateProductController = asyncHandler(async (req, res) => {
  const body = productInputSchema.partial().parse(req.body);
  const product = await updateProduct(String(req.params.id), body);
  res.json({ success: true, data: product });
});

export const deleteProductController = asyncHandler(async (req, res) => {
  const result = await deleteProduct(String(req.params.id));
  res.json({ success: true, data: result });
});

export const adjustStockController = asyncHandler(async (req, res) => {
  const { delta, reason } = z
    .object({
      delta: z.number().int(),
      reason: z.string().optional().default("Manual adjustment"),
    })
    .parse(req.body);

  const result = await adjustStock(
    String(req.params.id),
    delta,
    reason,
    req.user!.email,
  );
  res.json({ success: true, data: result });
});

export const getInventoryLogsController = asyncHandler(async (req, res) => {
  const rawId = String(req.params.id);
  const productId = rawId !== "all" ? rawId : undefined;
  const limitRaw = req.query.limit;
  const limit = Number(Array.isArray(limitRaw) ? limitRaw[0] : limitRaw) || 100;
  const logs = await getInventoryLogs(productId, limit);
  res.json({ success: true, data: logs });
});

export const getInventoryOverviewController = asyncHandler(async (_req, res) => {
  const products = await getInventoryOverview();
  res.json({ success: true, data: products });
});
