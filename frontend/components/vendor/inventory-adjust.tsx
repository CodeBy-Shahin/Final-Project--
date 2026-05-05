"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  productId: string;
  productName: string;
  currentStock: number;
};

export function InventoryAdjust({ productId, productName, currentStock }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (delta === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta, reason: reason || "Manual adjustment" }),
      });
      const data = (await res.json()) as { success: boolean; data?: { stockAfter: number } };
      if (!data.success) throw new Error("Failed");
      toast.success(`${productName} stock updated to ${data.data?.stockAfter ?? "?"}`);
      setOpen(false);
      setDelta(0);
      setReason("");
      router.refresh();
    } catch {
      toast.error("Failed to update stock");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Adjust
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-white p-3 shadow-sm">
      <div className="text-xs font-semibold text-muted-foreground">
        Stock: {currentStock} → {Math.max(0, currentStock + delta)}
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="outline"
          className="size-8 shrink-0"
          onClick={() => setDelta((d) => d - 1)}
        >
          <Minus className="size-3" />
        </Button>
        <Input
          type="number"
          value={delta}
          onChange={(e) => setDelta(Number(e.target.value))}
          className="h-8 w-20 text-center text-sm"
        />
        <Button
          size="icon"
          variant="outline"
          className="size-8 shrink-0"
          onClick={() => setDelta((d) => d + 1)}
        >
          <Plus className="size-3" />
        </Button>
      </div>
      <Input
        placeholder="Reason (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="h-8 text-sm"
      />
      <div className="flex gap-2">
        <Button size="sm" className="flex-1" onClick={handleSubmit} disabled={loading || delta === 0}>
          {loading ? "Saving…" : "Save"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setOpen(false); setDelta(0); }}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
