import "server-only";

import { API_BASE_URL } from "@/lib/config";
import { getSessionToken } from "@/lib/session";
import { fallbackDashboardOverview, fallbackProducts } from "@/lib/site";
import type { DashboardOverview, Product } from "@/types/domain";

type FetchDataOptions = {
  cache?: RequestCache;
  revalidate?: number;
  token?: string | null;
};

async function fetchData<T>(path: string, options: FetchDataOptions = {}): Promise<T | null> {
  const { cache, revalidate = 60, token } = options;

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
      ...(cache ? { cache } : { next: { revalidate } }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { data?: T };
    return payload.data ?? null;
  } catch {
    return null;
  }
}

export async function getFeaturedProducts(limit = 8) {
  const data = await fetchData<{ items: Product[] }>(`/products?featured=true&limit=${limit}`);
  return data?.items?.length ? data.items : fallbackProducts;
}

export async function getAllProducts(limit = 12) {
  const data = await fetchData<{ items: Product[] }>(`/products?limit=${limit}`);
  return data?.items?.length ? data.items : fallbackProducts;
}

export async function getProductBySlug(slug: string) {
  const data = await fetchData<Product>(`/products/${slug}`);

  if (data) {
    return data;
  }

  return fallbackProducts.find((product) => product.slug === slug) ?? null;
}

export async function getDashboardOverview() {
  const token = await getSessionToken();
  const data = await fetchData<DashboardOverview>("/analytics/overview", {
    token,
    cache: "no-store",
  });

  return data ?? fallbackDashboardOverview;
}
