import { TrendingDown, TrendingUp } from "lucide-react";

import { DemandForecastChart } from "@/components/admin/demand-forecast-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDemandForecast } from "@/lib/api";

export const metadata = { title: "Demand Forecast - Admin" };

const trendBadge = {
  rising: "success",
  stable: "outline",
  cooling: "warning",
} as const;

export default async function AdminDemandForecastPage() {
  const forecast = await getDemandForecast();
  const bestProduct = forecast.items[0];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Demand forecast</h1>
          <p className="mt-1 text-muted-foreground">
            Python NLP analysis of previous sales with future product demand prediction.
          </p>
        </div>
        <div className="rounded-md border border-border/70 bg-card px-3 py-2 text-sm">
          <span className="text-muted-foreground">Horizon</span>
          <span className="ml-2 font-semibold">{forecast.horizon}</span>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Most likely to sell</p>
            <p className="mt-2 text-xl font-bold">{bestProduct?.name ?? "No sales data yet"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {bestProduct?.vendorName ?? "Waiting for product sales"}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Predicted units</p>
            <p className="mt-2 text-3xl font-bold text-primary">
              {bestProduct?.predictedUnits ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Model confidence</p>
            <p className="mt-2 text-3xl font-bold text-accent">{bestProduct?.confidence ?? 0}%</p>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle className="text-base">Recent sales vs future prediction</CardTitle>
        </CardHeader>
        <CardContent>
          {forecast.items.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No previous sales are available for demand forecasting.
            </div>
          ) : (
            <DemandForecastChart items={forecast.items} />
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle className="text-base">Future demand ranking</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-secondary/40">
                  <th className="px-4 py-3 text-left font-semibold">Product</th>
                  <th className="px-4 py-3 text-left font-semibold">Vendor</th>
                  <th className="px-4 py-3 text-left font-semibold">Recent sold</th>
                  <th className="px-4 py-3 text-left font-semibold">Predicted</th>
                  <th className="px-4 py-3 text-left font-semibold">Trend</th>
                  <th className="px-4 py-3 text-left font-semibold">NLP keywords</th>
                  <th className="px-4 py-3 text-left font-semibold">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {forecast.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      No product demand data found.
                    </td>
                  </tr>
                )}
                {forecast.items.map((item) => (
                  <tr key={item.productId} className="hover:bg-secondary/20">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.vendorName}</td>
                    <td className="px-4 py-3 font-semibold">{item.recentSold}</td>
                    <td className="px-4 py-3 font-bold text-primary">{item.predictedUnits}</td>
                    <td className="px-4 py-3">
                      <Badge variant={trendBadge[item.trend]}>
                        {item.trend === "rising" ? (
                          <TrendingUp className="mr-1 size-3" />
                        ) : item.trend === "cooling" ? (
                          <TrendingDown className="mr-1 size-3" />
                        ) : null}
                        {item.trend}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.keywords.length ? item.keywords.join(", ") : "No keywords"}
                    </td>
                    <td className="px-4 py-3 font-semibold">{item.confidence}%</td>
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
