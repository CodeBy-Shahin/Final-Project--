import Link from "next/link";
import { ArrowRight, CheckCircle2, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/config";
import { formatPrice } from "@/lib/commerce";
import { getSessionToken } from "@/lib/session";
import { OrderTrackingTimeline } from "@/components/storefront/order-tracking-timeline";

type OrderItem = {
  productName: string;
  quantity: number;
  unitPrice: number;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  items: OrderItem[];
  shippingAddress?: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    district?: string;
  };
  shipment?: {
    carrier?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    currentLocation?: string;
  };
  trackingEvents?: Array<{
    status: string;
    label: string;
    description: string;
    location?: string;
    createdAt: string;
  }>;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-violet-50 text-violet-700 border-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

async function getOrder(id: string): Promise<Order | null> {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const payload = (await res.json()) as { data?: Order };
    return payload.data ?? null;
  } catch {
    return null;
  }
}

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-6 px-4 py-24 sm:px-6 lg:px-8">
        <Package className="size-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Order not found</h1>
        <Button asChild>
          <Link href="/dashboard/orders">View all orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="size-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Order confirmed!</h1>
        <p className="mt-2 text-muted-foreground">
          Thank you. Your order has been placed successfully.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-2 font-mono text-sm font-semibold">
          {order.orderNumber}
        </div>
      </div>

      <div className="space-y-4">
        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Order tracking</h2>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusColors[order.status] ?? "bg-secondary text-secondary-foreground"}`}
              >
                {order.status}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <span className="text-muted-foreground">Payment</span>
                <div className="mt-1 font-medium capitalize">{order.paymentMethod === "cod" ? "Cash on delivery" : order.paymentMethod}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Payment status</span>
                <div className="mt-1 font-medium capitalize">{order.paymentStatus}</div>
              </div>
            </div>
            <div className="mt-6">
              <OrderTrackingTimeline
                status={order.status}
                shipment={order.shipment}
                trackingEvents={order.trackingEvents}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-6">
            <h2 className="mb-4 font-semibold">Items ordered</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>
                    {item.productName}{" "}
                    <span className="text-muted-foreground">× {item.quantity}</span>
                  </span>
                  <span className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {order.shippingAddress && (
          <Card className="rounded-2xl border-border/70">
            <CardContent className="p-6">
              <h2 className="mb-4 font-semibold">Delivery address</h2>
              <div className="text-sm leading-7">
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p className="text-muted-foreground">{order.shippingAddress.phone}</p>
                <p className="text-muted-foreground">{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && (
                  <p className="text-muted-foreground">{order.shippingAddress.line2}</p>
                )}
                <p className="text-muted-foreground">
                  {order.shippingAddress.city}
                  {order.shippingAddress.district ? `, ${order.shippingAddress.district}` : ""}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3 pt-2">
          <Button asChild className="flex-1">
            <Link href="/dashboard/orders">
              Track orders
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
