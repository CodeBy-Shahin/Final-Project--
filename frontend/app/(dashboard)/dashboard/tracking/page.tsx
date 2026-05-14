import Link from "next/link";
import { ArrowRight, PackageSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrderTrackingTimeline } from "@/components/storefront/order-tracking-timeline";
import { API_BASE_URL } from "@/lib/config";
import { formatPrice } from "@/lib/commerce";
import { getSessionToken } from "@/lib/session";
import type { OrderSummary } from "@/types/domain";

async function getOrders(): Promise<OrderSummary[]> {
  const token = await getSessionToken();
  if (!token) return [];

  try {
    const res = await fetch(`${API_BASE_URL}/orders?limit=50`, {
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
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-violet-50 text-violet-700 border-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export const metadata = { title: "Track orders" };

export default async function TrackingPage() {
  const orders = await getOrders();
  const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status));
  const visibleOrders = activeOrders.length > 0 ? activeOrders : orders;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Track orders</h1>
        <p className="mt-1 text-muted-foreground">
          Follow admin approval, packing, shipping, and delivery updates in one place.
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="rounded-2xl border-border/70">
          <CardContent className="flex flex-col items-center gap-4 py-14">
            <PackageSearch className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">No orders available for tracking.</p>
            <Button asChild>
              <Link href="/products">Browse products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {visibleOrders.map((order) => (
            <Card key={order.id} className="rounded-2xl border-border/70">
              <CardContent className="p-6">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="font-mono text-xs font-semibold text-muted-foreground">
                      {order.orderNumber}
                    </div>
                    <h2 className="mt-1 text-lg font-semibold">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""} in this order
                    </h2>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Placed {new Date(order.createdAt).toLocaleDateString("en-BD")}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusColors[order.status] ?? "bg-secondary border-border text-secondary-foreground"}`}
                    >
                      {order.status}
                    </span>
                    <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/orders/${order.id}`}>
                        Details
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <OrderTrackingTimeline
                  status={order.status}
                  shipment={order.shipment}
                  trackingEvents={order.trackingEvents}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
