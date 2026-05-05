import type { OrderSummary } from "@/types/domain";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function OrdersPanel({ orders }: { orders: OrderSummary[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent orders</CardTitle>
        <CardDescription>Live operational queue with payment and fulfillment status.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="grid gap-3 rounded-md border border-border/70 bg-background/70 p-4 md:grid-cols-[1.1fr_1fr_1fr_auto]"
          >
            <div>
              <div className="font-medium">{order.orderNumber}</div>
              <div className="text-sm text-muted-foreground">{order.customerName}</div>
            </div>
            <div className="text-sm">
              <div className="text-muted-foreground">Total</div>
              <div className="font-semibold">{currency(order.total)}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={order.status === "delivered" ? "success" : "outline"}>
                {order.status}
              </Badge>
              <Badge variant={order.paymentStatus === "paid" ? "success" : "warning"}>
                {order.paymentStatus}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
