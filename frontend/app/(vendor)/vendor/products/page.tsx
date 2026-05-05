import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/config";
import { formatPrice } from "@/lib/commerce";
import { getSessionToken } from "@/lib/session";
import { VendorProductActions } from "@/components/vendor/product-actions";

type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: string;
  featured: boolean;
  category: { name: string } | null;
  images: string[];
};

async function getProducts(): Promise<Product[]> {
  const token = await getSessionToken();
  if (!token) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/products/manage/all?limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: { items?: Product[] } };
    return data.data?.items ?? [];
  } catch {
    return [];
  }
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  draft: "bg-amber-50 text-amber-700",
  archived: "bg-secondary text-secondary-foreground",
};

export const metadata = { title: "Products — Vendor" };

export default async function VendorProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="mt-1 text-muted-foreground">{products.length} products in catalog</p>
        </div>
        <Button asChild>
          <Link href="/vendor/products/new">
            <Plus className="size-4" />
            Add product
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle className="text-base">All products</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-secondary/40">
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">SKU</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Price</th>
                  <th className="px-4 py-3 text-left font-semibold">Stock</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      No products yet.{" "}
                      <Link href="/vendor/products/new" className="text-primary hover:underline">
                        Add your first product
                      </Link>
                    </td>
                  </tr>
                )}
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-secondary/20">
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{product.sku}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {product.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-medium ${product.stock === 0 ? "text-red-600" : product.stock < 10 ? "text-amber-600" : "text-foreground"}`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[product.status] ?? "bg-secondary"}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <VendorProductActions productId={product.id} currentStatus={product.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
