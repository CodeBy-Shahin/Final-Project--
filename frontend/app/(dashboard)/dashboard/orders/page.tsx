import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/config";
import { formatPrice } from "@/lib/commerce";
import { getSessionToken } from "@/lib/session";

type Order = {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: Array<{ productName: string; quantity: number; unitPrice: number }>;
};

async function getOrders(): Promise<Order[]> {
  const token = await getSessionToken();
  if (!token) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/orders?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: { items?: Order[] } };
    return data.data?.items ?? [];
  } catch {
    return [];
  }
}

const statusColors: Record<string, string> = {
  pending: "text-amber-700 bg-amber-50 border-amber-200",
  processing: "text-blue-700 bg-blue-50 border-blue-200",
  shipped: "text-violet-700 bg-violet-50 border-violet-200",
  delivered: "text-emerald-700 bg-emerald-50 border-emerald-200",
  cancelled: "text-red-700 bg-red-50 border-red-200",
};

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My orders</h1>
        <p className="mt-1 text-muted-foreground">{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>
      </div>

      {orders.length === 0 ? (
        <Card className="rounded-2xl border-border/70">
          <CardContent className="flex flex-col items-center gap-4 py-14">
            <Package className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">No orders yet.</p>
            <Button asChild>
              <Link href="/products">Browse products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden rounded-2xl border-border/70">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
                  <div>
                    <div className="font-semibold">{order.orderNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-BD", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusColors[order.status] ?? "bg-secondary border-border text-secondary-foreground"}`}
                    >
                      {order.status}
                    </span>
                    <span className="text-lg font-bold text-primary">{formatPrice(order.total)}</span>
                  </div>
                </div>
                <div className="px-5 py-4">
                  <div className="mb-3 space-y-1.5 text-sm text-muted-foreground">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{item.productName} × {item.quantity}</span>
                        <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground capitalize">
                      Payment: {order.paymentStatus}
                    </span>
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      View details
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
