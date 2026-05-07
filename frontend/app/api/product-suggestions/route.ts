import { NextResponse } from "next/server";

import { API_BASE_URL } from "@/lib/config";
import { fallbackProducts } from "@/lib/site";
import type { Product } from "@/types/domain";

type ProductsResponse = {
  data?: {
    items?: Product[];
  };
};

function toSuggestion(product: Product) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: product.images[0] ?? null,
    category: product.category?.name ?? null,
    tags: product.tags,
  };
}

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/products?limit=100`, {
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      throw new Error("Unable to load products");
    }

    const payload = (await response.json()) as ProductsResponse;
    const products = payload.data?.items?.length ? payload.data.items : fallbackProducts;

    return NextResponse.json({
      success: true,
      data: products.map(toSuggestion),
    });
  } catch {
    return NextResponse.json({
      success: true,
      data: fallbackProducts.map(toSuggestion),
    });
  }
}
