import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardOverview } from "@/lib/api";

export const metadata = { title: "Low-stock Product - Admin" };

function stockBadge(stock: number) {
  if (stock === 0) {
    return <Badge variant="danger">Out of stock</Badge>;
  }

  return <Badge variant="warning">Low stock</Badge>;
}

export default async function AdminLowStockProductPage() {
  const overview = await getDashboardOverview();
  const alerts = overview.inventoryAlerts;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Low-stock product</h1>
          <p className="mt-1 text-muted-foreground">
            Products below 7 units with the vendor who provides each item.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-bold text-red-700 shadow-sm shadow-red-100 ring-2 ring-red-100">
          <AlertTriangle className="size-4" />
          {alerts.length} alert{alerts.length === 1 ? "" : "s"}
        </div>
      </div>

      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle className="text-base">Low-stock product details</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-secondary/40">
                  <th className="px-4 py-3 text-left font-semibold">Product</th>
                  <th className="px-4 py-3 text-left font-semibold">Vendor</th>
                  <th className="px-4 py-3 text-left font-semibold">SKU</th>
                  <th className="px-4 py-3 text-left font-semibold">Stock</th>
                  <th className="px-4 py-3 text-left font-semibold">Alert below</th>
                  <th className="px-4 py-3 text-left font-semibold">Suggest</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {alerts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      No product stock is below 7 units right now.
                    </td>
                  </tr>
                )}
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-secondary/20">
                    <td className="px-4 py-3 font-medium">{alert.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{alert.vendorName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {alert.sku}
                    </td>
                    <td className="px-4 py-3 font-bold">{alert.stock}</td>
                    <td className="px-4 py-3 text-muted-foreground">{alert.threshold ?? 7}</td>
                    <td className="px-4 py-3 font-semibold">{alert.recommendedOrderQty}</td>
                    <td className="px-4 py-3">{stockBadge(alert.stock)}</td>
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
