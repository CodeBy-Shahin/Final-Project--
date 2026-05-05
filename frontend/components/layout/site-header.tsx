"use client";

import type { FormEvent } from "react";

import Link from "next/link";
import {
  LayoutDashboard,
  MapPinHouse,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { useSession } from "@/components/auth/session-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRoleLabel, getDashboardPath } from "@/lib/auth";
import { useCart } from "@/lib/cart";

const marketplaceLinks = [
  { href: "/products?category=grocery-essentials", label: "Groceries" },
  { href: "/products?category=home-care", label: "Home Care" },
  { href: "/products?category=personal-care", label: "Beauty" },
  { href: "/products?category=kitchen-dining", label: "Kitchen" },
  { href: "/products?category=electronics-gadgets", label: "Gadgets" },
  { href: "/products?category=fashion-lifestyle", label: "Fashion" },
];

export function SiteHeader() {
  const router = useRouter();
  const { session } = useSession();
  const { count } = useCart();

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("query") ?? "").trim();
    router.push(query ? `/products?query=${encodeURIComponent(query)}` : "/products");
  }

  const dashboardPath = session ? getDashboardPath(session.user.role) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-white/95 backdrop-blur-xl">
      <div className="bg-[#2e1508] text-white/80">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-[11px] sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <MapPinHouse className="size-3.5" />
              Delivering across Dhaka and major cities
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Truck className="size-3.5" />
              Same-day dispatch on selected essentials
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/products" className="transition-colors hover:text-white">
              Daily Deals
            </Link>
            <Link href="/login" className="transition-colors hover:text-white">
              Seller &amp; Admin Login
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[220px_1fr_auto] lg:items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <ShoppingBag className="size-6" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight">Smart Commerce</div>
              <div className="text-xs text-muted-foreground">Marketplace for everyday Bangladesh</div>
            </div>
          </Link>

          <form className="grid gap-3 sm:grid-cols-[1fr_auto] lg:mx-2" onSubmit={handleSearchSubmit}>
            <div className="flex items-center rounded-xl border border-border bg-card px-3 shadow-sm">
              <Search className="size-4 text-muted-foreground" />
              <Input
                name="query"
                placeholder="Search rice, beauty, cookware, gadgets and more"
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
            </div>
            <Button type="submit" size="lg" className="h-11">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-2 justify-self-start lg:justify-self-end">
            <Button variant="ghost" asChild className="hidden md:inline-flex">
              <Link href="/products">
                <Store className="size-4" />
                Shop
              </Link>
            </Button>

            <Button variant="ghost" asChild className="relative hidden md:inline-flex">
              <Link href="/cart">
                <ShoppingCart className="size-4" />
                Cart
                {count > 0 && (
                  <Badge className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full p-0 text-[10px]">
                    {count > 99 ? "99+" : count}
                  </Badge>
                )}
              </Link>
            </Button>

            {session ? (
              <>
                <div className="hidden items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 lg:flex">
                  <UserRound className="size-4 text-primary" />
                  <div>
                    <div className="text-sm font-semibold">{session.user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatRoleLabel(session.user.role)}
                    </div>
                  </div>
                </div>
                {dashboardPath && (
                  <Button asChild className="hidden sm:inline-flex">
                    <Link href={dashboardPath}>
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </Link>
                  </Button>
                )}
                <LogoutButton
                  className="hidden sm:inline-flex"
                  label="Sign out"
                  redirectTo="/"
                  variant="outline"
                />
              </>
            ) : (
              <Button variant="outline" asChild className="hidden sm:inline-flex">
                <Link href="/login">
                  <ShieldCheck className="size-4" />
                  Login
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {marketplaceLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-full border border-border bg-white px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
