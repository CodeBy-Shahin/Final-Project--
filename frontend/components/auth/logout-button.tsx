"use client";

import { LoaderCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { useSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

export function LogoutButton({
  className,
  label = "Sign out",
  redirectTo = "/",
  size = "default",
  variant = "outline",
}: {
  className?: string;
  label?: string;
  redirectTo?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}) {
  const router = useRouter();
  const { setSession } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isBusy = isSubmitting || isPending;

  async function handleLogout() {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/session/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setSession(null);
      toast.success("Session cleared");

      startTransition(() => {
        router.push(redirectTo);
        router.refresh();
      });
    } catch {
      toast.error("Unable to sign out right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Button
      type="button"
      className={className}
      disabled={isBusy}
      onClick={handleLogout}
      size={size}
      variant={variant}
    >
      {isBusy ? <LoaderCircle className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      {label ? <span>{label}</span> : null}
    </Button>
  );
}
