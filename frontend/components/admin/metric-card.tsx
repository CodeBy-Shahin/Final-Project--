import type { DashboardMetric } from "@/types/domain";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({ metric }: { metric: DashboardMetric }) {
  const toneClass =
    metric.tone === "success"
      ? "text-success"
      : metric.tone === "warning"
        ? "text-warning"
        : "text-primary";

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-3">
        <p className="text-sm text-muted-foreground">{metric.label}</p>
        <CardTitle className="text-3xl">{metric.value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={cn("text-sm font-medium", toneClass)}>{metric.delta}</p>
      </CardContent>
    </Card>
  );
}
