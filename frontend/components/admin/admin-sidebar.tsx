"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ClipboardList,
  LineChart,
  LayoutDashboard,
  PackageSearch,
  Sparkles,
  Store,
  Users,
  Warehouse,
} from "lucide-react";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/users", label: "Customers", icon: Users },
  { href: "/admin/vendors", label: "Vendors", icon: Store },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/low-stock-product", label: "Low-stock product", icon: PackageSearch },
  { href: "/admin/demand-forecast", label: "Demand forecast", icon: LineChart },
  { href: "/products", label: "Catalog", icon: Boxes },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="dashboard-shell hidden min-h-screen w-72 border-r border-border/70 xl:block">
      <div className="sticky top-0 flex min-h-screen flex-col px-6 py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">Smart Commerce</div>
            <div className="text-xs text-muted-foreground">Admin console</div>
          </div>
        </div>

        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href) && item.href !== "/admin";
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-lg border border-border/80 bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Governance
          </p>
          <p className="mt-2 text-sm font-medium">Audit coverage enabled</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Core admin actions are routed through the audit and analytics layer.
          </p>
        </div>
      </div>
    </aside>
  );
}
