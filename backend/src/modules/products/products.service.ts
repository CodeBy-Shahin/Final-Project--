import { InventoryLogModel } from "@/models/inventory.model";
import { CategoryModel } from "@/models/category.model";
import { ProductModel } from "@/models/product.model";
import { ApiError } from "@/utils/api-error";

type GetProductsOptions = {
  featured?: boolean;
  limit?: number;
};

export async function getProducts(options: GetProductsOptions) {
  const query = ProductModel.find({ status: "active" }).populate("category");

  if (options.featured) {
    query.where({ featured: true });
  }

  const limit = options.limit ?? 12;
  const products = await query.sort({ featured: -1, createdAt: -1 }).limit(limit).lean();

  return products.map((product) => ({
    id: String(product._id),
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock,
    reorderPoint: product.reorderPoint,
    rating: product.rating,
    featured: product.featured,
    status: product.status,
    tags: product.tags,
    images: product.images,
    metrics: product.metrics,
    category: serializeCategory(product.category),
  }));
}

export async function getProductBySlug(slug: string) {
  const product = await ProductModel.findOne({ slug, status: "active" })
    .populate("category")
    .lean();

  if (!product) {
    return null;
  }

  const related = await ProductModel.find({
    _id: { $ne: product._id },
    category: extractCategoryId(product.category),
    status: "active",
  })
    .limit(4)
    .lean();

  return {
    id: String(product._id),
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock,
    reorderPoint: product.reorderPoint,
    rating: product.rating,
    featured: product.featured,
    tags: product.tags,
    images: product.images,
    metrics: product.metrics,
    category: serializeCategory(product.category),
    related: related.map((item) => ({
      id: String(item._id),
      name: item.name,
      slug: item.slug,
      price: item.price,
      stock: item.stock,
      rating: item.rating,
      images: item.images,
    })),
  };
}

export async function getProductFilters() {
  const categories = await CategoryModel.find().sort({ name: 1 }).lean();

  return categories.map((category) => ({
    id: String(category._id),
    name: category.name,
    slug: category.slug,
  }));
}

function extractCategoryId(category: unknown) {
  if (category && typeof category === "object" && "_id" in category) {
    return category._id;
  }

  return category;
}

function serializeCategory(category: unknown) {
  if (
    category &&
    typeof category === "object" &&
    "_id" in category &&
    "name" in category &&
    "slug" in category
  ) {
    return {
      id: String(category._id),
      name: String(category.name),
      slug: String(category.slug),
    };
  }

  return null;
}

type ProductInput = {
  name: string;
  slug?: string;
  description: string;
  categoryId: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images?: string[];
  tags?: string[];
  featured?: boolean;
  status?: "active" | "draft" | "archived";
};

function makeSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function makeSku() {
  return "SKU-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createProduct(input: ProductInput, vendorId?: string) {
  const category = await CategoryModel.findById(input.categoryId);
  if (!category) throw new ApiError(400, "Category not found");

  const slug = input.slug ?? makeSlug(input.name);
  const sku = makeSku();

  const product = await ProductModel.create({
    name: input.name,
    slug,
    sku,
    description: input.description,
    category: input.categoryId,
    vendor: vendorId,
    price: input.price,
    compareAtPrice: input.compareAtPrice,
    stock: input.stock ?? 0,
    images: input.images ?? [],
    tags: input.tags ?? [],
    featured: input.featured ?? false,
    status: input.status ?? "active",
  });

  const populated = await ProductModel.findById(product._id).populate("category").lean();
  return {
    id: String(populated!._id),
    name: populated!.name,
    slug: populated!.slug,
    sku: populated!.sku,
    description: populated!.description,
    price: populated!.price,
    compareAtPrice: populated!.compareAtPrice,
    stock: populated!.stock,
    rating: populated!.rating,
    featured: populated!.featured,
    status: populated!.status,
    tags: populated!.tags,
    images: populated!.images,
    metrics: populated!.metrics,
    category: serializeCategory(populated!.category),
  };
}

export async function updateProduct(productId: string, input: Partial<ProductInput>) {
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.price !== undefined) updateData.price = input.price;
  if (input.compareAtPrice !== undefined) updateData.compareAtPrice = input.compareAtPrice;
  if (input.stock !== undefined) updateData.stock = input.stock;
  if (input.images !== undefined) updateData.images = input.images;
  if (input.tags !== undefined) updateData.tags = input.tags;
  if (input.featured !== undefined) updateData.featured = input.featured;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.categoryId !== undefined) {
    const category = await CategoryModel.findById(input.categoryId);
    if (!category) throw new ApiError(400, "Category not found");
    updateData.category = input.categoryId;
  }

  const product = await ProductModel.findByIdAndUpdate(productId, updateData, { new: true })
    .populate("category")
    .lean();

  if (!product) throw new ApiError(404, "Product not found");

  return {
    id: String(product._id),
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock,
    rating: product.rating,
    featured: product.featured,
    status: product.status,
    tags: product.tags,
    images: product.images,
    metrics: product.metrics,
    category: serializeCategory(product.category),
  };
}

export async function deleteProduct(productId: string) {
  const product = await ProductModel.findByIdAndUpdate(
    productId,
    { status: "archived" },
    { new: true },
  );
  if (!product) throw new ApiError(404, "Product not found");
  return { success: true };
}

export async function adjustStock(
  productId: string,
  delta: number,
  reason: string,
  createdBy: string,
) {
  const product = await ProductModel.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const stockBefore = product.stock;
  const stockAfter = Math.max(0, stockBefore + delta);

  await ProductModel.findByIdAndUpdate(productId, { stock: stockAfter });

  await InventoryLogModel.create({
    product: productId,
    productName: product.name,
    type: delta > 0 ? "in" : delta < 0 ? "out" : "adjustment",
    quantity: delta,
    stockBefore,
    stockAfter,
    reason,
    createdBy,
  });

  return { productId, productName: product.name, stockBefore, stockAfter, delta };
}

export async function getInventoryLogs(productId?: string, limit = 100) {
  const filter = productId ? { product: productId } : {};
  const logs = await InventoryLogModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return logs.map((log) => {
    const doc = log as typeof log & { createdAt?: Date };
    return {
      id: String(log._id),
      productId: String(log.product),
      productName: log.productName,
      type: log.type,
      quantity: log.quantity,
      stockBefore: log.stockBefore,
      stockAfter: log.stockAfter,
      reason: log.reason,
      createdBy: log.createdBy,
      createdAt: doc.createdAt,
    };
  });
}

export async function getInventoryOverview() {
  const products = await ProductModel.find({ status: { $ne: "archived" } })
    .populate("category")
    .sort({ stock: 1 })
    .lean();

  return products.map((p) => ({
    id: String(p._id),
    name: p.name,
    sku: p.sku,
    stock: p.stock,
    reorderPoint: p.reorderPoint ?? 0,
    status: p.status,
    category: serializeCategory(p.category),
    images: p.images,
  }));
}

export async function listAllProducts(options: { status?: string; page?: number; limit?: number }) {
  const { status, page = 1, limit = 30 } = options;
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const [products, total] = await Promise.all([
    ProductModel.find(filter).populate("category").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ProductModel.countDocuments(filter),
  ]);

  return {
    items: products.map((p) => ({
      id: String(p._id),
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      price: p.price,
      stock: p.stock,
      status: p.status,
      featured: p.featured,
      images: p.images,
      category: serializeCategory(p.category),
    })),
    total,
    page,
    limit,
  };
}
