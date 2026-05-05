import type { AuditEntry } from "@/types/domain";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ActivityFeed({ items }: { items: AuditEntry[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Audit activity</CardTitle>
        <CardDescription>Traceable admin actions across the platform.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="text-sm font-medium">{item.action}</div>
              <div className="text-xs text-muted-foreground">
                {item.actorEmail} • {item.entityType}
              </div>
            </div>
            <div className="space-y-2 text-right">
              <Badge variant={item.status === "success" ? "success" : "danger"}>
                {item.status}
              </Badge>
              <div className="text-xs text-muted-foreground">
                {formatTimestamp(item.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
