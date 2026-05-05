import type { ReactNode } from "react";
import Link from "next/link";
import { ShoppingBag, Store } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { SessionProvider } from "@/components/auth/session-provider";
import { VendorSidebarLinks } from "@/components/vendor/sidebar-links";
import { requireVendorSession } from "@/lib/session";

export default async function VendorLayout({ children }: { children: ReactNode }) {
  const session = await requireVendorSession("/vendor");

  return (
    <SessionProvider initialSession={session}>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-border/70 bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <ShoppingBag className="size-5 text-primary" />
              Smart Commerce
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Vendor
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 text-sm sm:flex">
                <Store className="size-4 text-muted-foreground" />
                <span className="font-medium">{session.user.name}</span>
              </div>
              <LogoutButton label="Sign out" redirectTo="/" variant="outline" />
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <aside className="hidden w-56 shrink-0 lg:block">
            <VendorSidebarLinks />
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
