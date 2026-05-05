"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

export function AdminOrderActions({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function updateStatus(status: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Order updated to ${status}`);
        router.refresh();
      } else {
        toast.error("Failed to update order");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  }

  const nextStatus = statuses[statuses.indexOf(currentStatus as typeof statuses[number]) + 1];

  if (!nextStatus || currentStatus === "cancelled" || currentStatus === "delivered") {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={busy}
      onClick={() => updateStatus(nextStatus)}
      className="h-7 text-xs capitalize"
    >
      → {nextStatus}
    </Button>
  );
}
