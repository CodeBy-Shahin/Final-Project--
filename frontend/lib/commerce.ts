import type { Product } from "@/types/domain";

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function getDiscountPercentage(product: Pick<Product, "price" | "compareAtPrice">) {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) {
    return 0;
  }

  return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
}

export function getStockMessage(product: Pick<Product, "stock" | "reorderPoint">) {
  if (product.stock === 0) {
    return "Out of stock";
  }

  if (product.stock <= product.reorderPoint) {
    return "Limited stock";
  }

  if (product.stock <= product.reorderPoint * 2) {
    return "Selling fast";
  }

  return "Ready to ship";
}
