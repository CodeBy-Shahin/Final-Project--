import type { InventoryAlert } from "@/types/domain";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function InventoryAlerts({ alerts }: { alerts: InventoryAlert[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Below stock products</CardTitle>
        <CardDescription>
          Products with fewer than 7 units, grouped with the responsible vendor.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 && (
          <div className="rounded-md border border-dashed border-border/70 bg-background/70 p-6 text-center text-sm text-muted-foreground">
            No products are below 7 units right now.
          </div>
        )}
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="rounded-md border border-border/70 bg-background/70 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{alert.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {alert.vendorName} - {alert.sku}
                </div>
              </div>
              <Badge
                variant={
                  alert.urgency === "critical"
                    ? "danger"
                    : alert.urgency === "high"
                      ? "warning"
                      : "outline"
                }
              >
                {alert.urgency}
              </Badge>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div>
                <div className="text-muted-foreground">Stock</div>
                <div className="font-semibold">{alert.stock}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Threshold</div>
                <div className="font-semibold">{alert.threshold ?? 7}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Suggest</div>
                <div className="font-semibold">{alert.recommendedOrderQty}</div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
