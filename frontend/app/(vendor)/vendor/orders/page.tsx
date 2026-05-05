import { API_BASE_URL } from "@/lib/config";
import { formatPrice } from "@/lib/commerce";
import { getSessionToken } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminOrderActions } from "@/components/admin/order-actions";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: Array<{ productName: string; quantity: number; unitPrice: number }>;
  shippingAddress?: {
    name: string;
    phone: string;
    line1: string;
    city: string;
  };
};

async function getOrders(): Promise<Order[]> {
  const token = await getSessionToken();
  if (!token) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/orders?limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: { items?: Order[] } };
    return data.data?.items ?? [];
  } catch {
    return [];
  }
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-violet-50 text-violet-700 border-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export const metadata = { title: "Orders — Vendor" };

export default async function VendorOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="mt-1 text-muted-foreground">{orders.length} total orders</p>
      </div>

      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle className="text-base">All orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-secondary/40">
                  <th className="px-4 py-3 text-left font-semibold">Order</th>
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold">Delivery address</th>
                  <th className="px-4 py-3 text-left font-semibold">Items</th>
                  <th className="px-4 py-3 text-left font-semibold">Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      No orders yet.
                    </td>
                  </tr>
                )}
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/20">
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{order.customerName}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {order.shippingAddress ? (
                        <div className="text-xs leading-5">
                          <div>{order.shippingAddress.line1}</div>
                          <div>{order.shippingAddress.city}</div>
                          <div>{order.shippingAddress.phone}</div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="space-y-0.5 text-xs">
                        {order.items.map((item, i) => (
                          <div key={i}>{item.productName} × {item.quantity}</div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-primary">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${statusColors[order.status] ?? "bg-secondary border-border"}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(order.createdAt).toLocaleDateString("en-BD")}
                    </td>
                    <td className="px-4 py-3">
                      <AdminOrderActions orderId={order.id} currentStatus={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
