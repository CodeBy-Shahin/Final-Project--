import { ActivityFeed } from "@/components/admin/activity-feed";
import { InventoryAlerts } from "@/components/admin/inventory-alerts";
import { MetricCard } from "@/components/admin/metric-card";
import { OrdersPanel } from "@/components/admin/orders-panel";
import { RevenueTrend } from "@/components/admin/revenue-trend";
import { TopProducts } from "@/components/admin/top-products";
import { getDashboardOverview } from "@/lib/api";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminPage() {
  const overview = await getDashboardOverview();

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.kpis.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <RevenueTrend series={overview.revenueSeries} />
        <InventoryAlerts alerts={overview.inventoryAlerts} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <OrdersPanel orders={overview.recentOrders} />
        <ActivityFeed items={overview.auditActivity} />
      </section>

      <section>
        <TopProducts items={overview.topProducts} />
      </section>
    </div>
  );
}
