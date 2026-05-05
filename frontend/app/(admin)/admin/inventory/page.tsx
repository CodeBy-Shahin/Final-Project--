import { API_BASE_URL } from "@/lib/config";
import { getSessionToken } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryAdjust } from "@/components/vendor/inventory-adjust";

type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  reorderPoint: number;
  status: string;
  category: { name: string } | null;
};

async function getInventory(): Promise<InventoryItem[]> {
  const token = await getSessionToken();
  if (!token) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/products/inventory/overview`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = (await res.json()) as { data?: InventoryItem[] };
    return data.data ?? [];
  } catch {
    return [];
  }
}

function stockBadge(stock: number, reorderPoint: number) {
  if (stock === 0) return <Badge className="bg-red-100 text-red-700 border-red-200">Out of stock</Badge>;
  if (stock <= reorderPoint) return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Low stock</Badge>;
  return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">In stock</Badge>;
}

export const metadata = { title: "Inventory — Admin" };

export default async function AdminInventoryPage() {
  const items = await getInventory();
  const outOfStock = items.filter((i) => i.stock === 0).length;
  const lowStock = items.filter((i) => i.stock > 0 && i.stock <= i.reorderPoint).length;
  const totalUnits = items.reduce((s, i) => s + i.stock, 0);
  const totalProducts = items.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="mt-1 text-muted-foreground">Global stock overview across all vendors</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Products</p>
            <p className="mt-1 text-3xl font-bold">{totalProducts}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total units</p>
            <p className="mt-1 text-3xl font-bold">{totalUnits}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Low stock</p>
            <p className="mt-1 text-3xl font-bold text-amber-600">{lowStock}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Out of stock</p>
            <p className="mt-1 text-3xl font-bold text-red-600">{outOfStock}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle className="text-base">All products — stock levels</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-secondary/40">
                  <th className="px-4 py-3 text-left font-semibold">Product</th>
                  <th className="px-4 py-3 text-left font-semibold">SKU</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Stock</th>
                  <th className="px-4 py-3 text-left font-semibold">Reorder at</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      No products found.
                    </td>
                  </tr>
                )}
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/20">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.sku}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.category?.name ?? "—"}</td>
                    <td className="px-4 py-3 font-bold">{item.stock}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.reorderPoint}</td>
                    <td className="px-4 py-3">{stockBadge(item.stock, item.reorderPoint)}</td>
                    <td className="px-4 py-3">
                      <InventoryAdjust
                        productId={item.id}
                        productName={item.name}
                        currentStock={item.stock}
                      />
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
