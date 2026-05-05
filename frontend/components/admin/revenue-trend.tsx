import type { RevenuePoint } from "@/types/domain";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function RevenueTrend({ series }: { series: RevenuePoint[] }) {
  const maxRevenue = Math.max(...series.map((point) => point.revenue), 1);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Revenue pulse</CardTitle>
        <CardDescription>
          Last 7-day trajectory for revenue and order throughput.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-3">
          {series.map((point) => (
            <div key={point.label} className="flex flex-col items-center gap-3">
              <div className="flex h-44 items-end">
                <div
                  className="w-8 rounded-t-md bg-primary/85"
                  style={{
                    height: `${Math.max((point.revenue / maxRevenue) * 176, 28)}px`,
                  }}
                />
              </div>
              <div className="space-y-1 text-center">
                <div className="text-xs font-semibold text-foreground">{point.label}</div>
                <div className="text-xs text-muted-foreground">
                  ${point.revenue.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">{point.orders} orders</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
