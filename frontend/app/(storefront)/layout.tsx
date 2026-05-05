import type { ReactNode } from "react";

import { SessionProvider } from "@/components/auth/session-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CartProvider } from "@/lib/cart";
import { getSession } from "@/lib/session";

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  return (
    <SessionProvider initialSession={session}>
      <CartProvider>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </CartProvider>
    </SessionProvider>
  );
}
