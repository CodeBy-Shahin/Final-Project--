"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function VendorProductActions({
  productId,
  currentStatus,
}: {
  productId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggleStatus() {
    const newStatus = currentStatus === "active" ? "draft" : "active";
    setBusy(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Product set to ${newStatus}`);
        router.refresh();
      } else {
        toast.error("Failed to update product");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function archive() {
    if (!confirm("Archive this product? It will be hidden from the store.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });
      if (res.ok) {
        toast.success("Product archived");
        router.refresh();
      } else {
        toast.error("Failed to archive product");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={busy || currentStatus === "archived"}
        onClick={toggleStatus}
        className="h-7 text-xs"
      >
        {currentStatus === "active" ? "Draft" : "Publish"}
      </Button>
      {currentStatus !== "archived" && (
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={archive}
          className="h-7 text-xs text-red-500 hover:text-red-600"
        >
          Archive
        </Button>
      )}
    </div>
  );
}
