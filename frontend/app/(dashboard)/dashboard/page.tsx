import Link from "next/link";
import { ArrowRight, Package, ShoppingCart, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/config";
import { formatPrice } from "@/lib/commerce";
import { getSession, getSessionToken } from "@/lib/session";

type OrderSummary = {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
};

async function getRecentOrders(): Promise<OrderSummary[]> {
  const token = await getSessionToken();
  if (!token) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/orders?limit=3`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: { items?: OrderSummary[] } };
    return data.data?.items ?? [];
  } catch {
    return [];
  }
}

const statusColors: Record<string, string> = {
  pending: "text-amber-600 bg-amber-50",
  processing: "text-blue-600 bg-blue-50",
  shipped: "text-violet-600 bg-violet-50",
  delivered: "text-emerald-600 bg-emerald-50",
  cancelled: "text-red-600 bg-red-50",
};

export default async function DashboardPage() {
  const [session, recentOrders] = await Promise.all([getSession(), getRecentOrders()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Hello, {session?.user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-muted-foreground">Welcome to your account dashboard.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-border/70">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Package className="size-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{recentOrders.length}</div>
              <div className="text-sm text-muted-foreground">Recent orders</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShoppingCart className="size-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {formatPrice(recentOrders.reduce((s, o) => s + o.total, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total spent</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <UserRound className="size-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">{session?.user.name}</div>
              <div className="text-xs text-muted-foreground">{session?.user.email}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent orders</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/orders">
              View all
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {recentOrders.length === 0 ? (
          <Card className="rounded-2xl border-border/70">
            <CardContent className="flex flex-col items-center gap-4 py-14">
              <Package className="size-10 text-muted-foreground" />
              <p className="text-muted-foreground">No orders yet. Start shopping!</p>
              <Button asChild>
                <Link href="/products">Browse products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <Card className="rounded-2xl border-border/70 transition-colors hover:border-primary/30">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <Package className="size-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("en-BD")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColors[order.status] ?? "bg-secondary text-secondary-foreground"}`}
                      >
                        {order.status}
                      </span>
                      <div className="text-right">
                        <div className="font-bold text-primary">{formatPrice(order.total)}</div>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
