import type { TopProductInsight } from "@/types/domain";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function TopProducts({ items }: { items: TopProductInsight[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top performers</CardTitle>
        <CardDescription>
          Sales velocity and conversion-driven highlights from the last 30 days.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-md border border-border/70 bg-background/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {item.sales30d} units sold in 30 days
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="text-muted-foreground">Conv.</div>
                <div className="font-semibold">{item.conversionRate}%</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
              <div>
                <div className="text-muted-foreground">Views</div>
                <div className="font-semibold">{item.views30d}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Sales</div>
                <div className="font-semibold">{item.sales30d}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Stock</div>
                <div className="font-semibold">{item.stock}</div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
