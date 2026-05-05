import { AuditLogModel } from "@/models/audit-log.model";
import { OrderModel } from "@/models/order.model";
import { ProductModel } from "@/models/product.model";
import { UserModel } from "@/models/user.model";

const last7Labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export async function getDashboardOverview() {
  const [productCount, userCount, orderCount, recentOrders, lowStockProducts, topProducts, auditLogs] =
    await Promise.all([
      ProductModel.countDocuments({ status: "active" }),
      UserModel.countDocuments({}),
      OrderModel.countDocuments({}),
      OrderModel.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      ProductModel.find({ status: "active" })
        .sort({ stock: 1, "metrics.sales30d": -1 })
        .limit(5)
        .lean(),
      ProductModel.find({ status: "active" })
        .sort({ "metrics.sales30d": -1, rating: -1 })
        .limit(5)
        .lean(),
      AuditLogModel.find().sort({ createdAt: -1 }).limit(8).lean(),
    ]);

  const deliveredOrders = recentOrders.filter((order) => order.status === "delivered");
  const revenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0);

  const trendSource = last7Labels.map((label, index) => ({
    label,
    revenue: 5200 + index * 450 + (index % 2 === 0 ? 300 : 50),
    orders: 24 + index * 3,
  }));

  return {
    kpis: [
      {
        label: "Revenue this week",
        value: `$${revenue.toLocaleString()}`,
        delta: "+12.4%",
        tone: "success",
      },
      {
        label: "Orders",
        value: String(orderCount),
        delta: "+8.1%",
        tone: "neutral",
      },
      {
        label: "Active products",
        value: String(productCount),
        delta: "+6 added",
        tone: "neutral",
      },
      {
        label: "Customers",
        value: String(userCount),
        delta: "+14.3%",
        tone: "success",
      },
    ],
    revenueSeries: trendSource,
    inventoryAlerts: lowStockProducts.map((product) => ({
      id: String(product._id),
      name: product.name,
      sku: product.sku,
      stock: product.stock,
      reorderPoint: product.reorderPoint,
      urgency:
        product.stock === 0
          ? "critical"
          : product.stock <= product.reorderPoint
            ? "high"
            : "watch",
      recommendedOrderQty: Math.max(product.reorderPoint * 2 - product.stock, 0),
    })),
    topProducts: topProducts.map((product) => ({
      id: String(product._id),
      name: product.name,
      sales30d: product.metrics.sales30d,
      views30d: product.metrics.views30d,
      conversionRate: product.metrics.conversionRate,
      stock: product.stock,
    })),
    recentOrders: recentOrders.map((order) => ({
      id: String(order._id),
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
    })),
    auditActivity: auditLogs.map((log) => ({
      id: String(log._id),
      actorEmail: log.actorEmail ?? "system",
      action: log.action,
      entityType: log.entityType,
      status: log.status,
      createdAt: log.createdAt,
    })),
  };
}
