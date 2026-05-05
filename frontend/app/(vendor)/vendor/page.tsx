import Link from "next/link";
import { ArrowRight, Package, ShoppingCart, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/config";
import { formatPrice } from "@/lib/commerce";
import { getSession, getSessionToken } from "@/lib/session";

async function getVendorStats(token: string) {
  try {
    const [productsRes, ordersRes] = await Promise.all([
      fetch(`${API_BASE_URL}/products/manage/all?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch(`${API_BASE_URL}/orders?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
    ]);

    const productsData = productsRes.ok
      ? ((await productsRes.json()) as { data?: { total?: number } })
      : null;
    const ordersData = ordersRes.ok
      ? ((await ordersRes.json()) as { data?: { items?: Array<{ total: number; status: string }> } })
      : null;

    const orders = ordersData?.data?.items ?? [];
    const revenue = orders.reduce((s, o) => s + o.total, 0);
    const pending = orders.filter((o) => o.status === "pending").length;

    return {
      products: productsData?.data?.total ?? 0,
      orders: orders.length,
      revenue,
      pending,
      recentOrders: orders.slice(0, 5),
    };
  } catch {
    return { products: 0, orders: 0, revenue: 0, pending: 0, recentOrders: [] };
  }
}

const statusColors: Record<string, string> = {
  pending: "text-amber-600 bg-amber-50",
  processing: "text-blue-600 bg-blue-50",
  shipped: "text-violet-600 bg-violet-50",
  delivered: "text-emerald-600 bg-emerald-50",
  cancelled: "text-red-600 bg-red-50",
};

export default async function VendorDashboardPage() {
  const token = await getSessionToken();
  const session = await getSession();
  const stats = token ? await getVendorStats(token) : { products: 0, orders: 0, revenue: 0, pending: 0, recentOrders: [] };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Hello, {session?.user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-muted-foreground">Your vendor dashboard overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Products", value: stats.products, icon: Package, color: "bg-primary/10 text-primary" },
          { label: "Total orders", value: stats.orders, icon: ShoppingCart, color: "bg-blue-50 text-blue-600" },
          { label: "Revenue", value: formatPrice(stats.revenue), icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
          { label: "Pending", value: stats.pending, icon: ShoppingCart, color: "bg-amber-50 text-amber-600" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="rounded-2xl border-border/70">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex size-11 items-center justify-center rounded-xl ${stat.color}`}>
                  <Icon className="size-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Quick actions</h2>
            </div>
            <div className="grid gap-3">
              <Button asChild className="justify-start">
                <Link href="/vendor/products/new">
                  <Package className="size-4" />
                  Add new product
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/vendor/products">
                  <Package className="size-4" />
                  Manage products
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/vendor/orders">
                  <ShoppingCart className="size-4" />
                  View all orders
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Recent orders</h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/vendor/orders">
                  View all <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
            {stats.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {(stats.recentOrders as Array<{ id?: string; orderNumber?: string; total: number; status: string; createdAt?: string }>).map((order, i) => (
                  <div key={order.id ?? i} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{order.orderNumber ?? `Order ${i + 1}`}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColors[order.status] ?? "bg-secondary text-secondary-foreground"}`}>
                        {order.status}
                      </span>
                      <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
