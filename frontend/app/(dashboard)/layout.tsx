import type { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingBag, UserRound } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { SessionProvider } from "@/components/auth/session-provider";
import { requireSession } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireSession("/dashboard");

  return (
    <SessionProvider initialSession={session}>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-border/70 bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <ShoppingBag className="size-5 text-primary" />
              Smart Commerce
            </Link>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 text-sm sm:flex">
                <UserRound className="size-4 text-muted-foreground" />
                <span className="font-medium">{session.user.name}</span>
              </div>
              <LogoutButton label="Sign out" redirectTo="/" variant="outline" />
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <aside className="hidden w-56 shrink-0 lg:block">
            <nav className="space-y-1">
              {[
                { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
                { href: "/dashboard/orders", label: "My orders", icon: Package },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
