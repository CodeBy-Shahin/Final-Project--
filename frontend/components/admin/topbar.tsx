"use client";

import { Bell, CircleUserRound, Search } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { useSession } from "@/components/auth/session-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRoleLabel } from "@/lib/auth";

export function AdminTopbar() {
  const { session } = useSession();

  return (
    <div className="flex flex-col gap-4 border-b border-border/70 pb-6 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Command Center
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Governance-aware commerce dashboard
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Revenue, demand pressure, low-stock risk, and admin activity surfaced in one
          decision-ready workspace.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="icon" aria-label="Search dashboard">
          <Search className="size-4" />
        </Button>
        <Button variant="outline" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
        <div className="flex items-center gap-3 rounded-md border border-border/80 bg-card px-3 py-2">
          <CircleUserRound className="size-5 text-primary" />
          <div>
            <div className="text-sm font-medium">{session?.user.name ?? "Platform Administrator"}</div>
            <Badge variant="success" className="mt-1">
              {formatRoleLabel(session?.user.role)}
            </Badge>
          </div>
        </div>
        <LogoutButton label="Sign out" redirectTo="/login" variant="ghost" />
      </div>
    </div>
  );
}
