"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function UserStatusToggle({
  userId,
  currentStatus,
}: {
  userId: string;
  currentStatus: "active" | "disabled";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const newStatus = currentStatus === "active" ? "disabled" : "active";
    setBusy(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`User ${newStatus === "active" ? "activated" : "disabled"}`);
        router.refresh();
      } else {
        toast.error("Failed to update user");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      size="sm"
      variant={currentStatus === "active" ? "outline" : "default"}
      disabled={busy}
      onClick={toggle}
      className="h-7 text-xs"
    >
      {currentStatus === "active" ? "Disable" : "Activate"}
    </Button>
  );
}
