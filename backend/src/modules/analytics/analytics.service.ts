import { AuditLogModel } from "@/models/audit-log.model";
import { OrderModel } from "@/models/order.model";
import { ProductModel } from "@/models/product.model";
import { UserModel } from "@/models/user.model";

import { spawn } from "node:child_process";
import path from "node:path";

const last7Labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const lowStockThreshold = 7;
const demandHistoryLabels = ["W-5", "W-4", "W-3", "W-2", "W-1", "Current"];

type DemandForecastInput = {
  productId: string;
  name: string;
  vendorName: string;
  history: Array<{ label: string; units: number }>;
};

type PythonForecast = {
  productId: string;
  keywords: string[];
  totalSold: number;
  recentSold: number;
  predictedUnits: number;
  trend: "rising" | "stable" | "cooling";
  confidence: number;
  forecast: Array<{ label: string; units: number }>;
};

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
      ProductModel.find({ status: "active", stock: { $lt: lowStockThreshold } })
        .populate("vendor", "name email")
        .sort({ stock: 1, "metrics.sales30d": -1 })
        .limit(10)
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
      vendorName:
        product.vendor && typeof product.vendor === "object" && "name" in product.vendor
          ? String(product.vendor.name)
          : "Unassigned vendor",
      sku: product.sku,
      stock: product.stock,
      threshold: lowStockThreshold,
      urgency: product.stock === 0 ? "critical" : "high",
      recommendedOrderQty: Math.max(lowStockThreshold - product.stock, 0),
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

export async function getDemandForecast() {
  const [products, orders] = await Promise.all([
    ProductModel.find({ status: "active" }).populate("vendor", "name email").lean(),
    OrderModel.find({ status: { $ne: "cancelled" } }).sort({ createdAt: 1 }).lean(),
  ]);

  const productInputs: DemandForecastInput[] = products.map((product) => ({
    productId: String(product._id),
    name: product.name,
    vendorName:
      product.vendor && typeof product.vendor === "object" && "name" in product.vendor
        ? String(product.vendor.name)
        : "Unassigned vendor",
    history: demandHistoryLabels.map((label) => ({ label, units: 0 })),
  }));

  const productMap = new Map(productInputs.map((product) => [product.productId, product]));

  for (const order of orders) {
    const doc = order as typeof order & { createdAt?: Date };
    const bucket = getHistoryBucket(doc.createdAt);

    for (const item of order.items) {
      const productId = String(item.product);
      const product = productMap.get(productId);

      if (product && bucket >= 0) {
        product.history[bucket].units += item.quantity;
      }
    }
  }

  const pythonForecasts = await runPythonDemandForecast(productInputs);

  return {
    generatedAt: new Date().toISOString(),
    horizon: "Next 21 days",
    items: pythonForecasts.slice(0, 8).map((forecast) => {
      const product = productMap.get(forecast.productId);

      return {
        ...forecast,
        name: product?.name ?? "Unknown product",
        vendorName: product?.vendorName ?? "Unassigned vendor",
        history: product?.history ?? [],
      };
    }),
  };
}

function getHistoryBucket(createdAt?: Date) {
  if (!createdAt) return -1;

  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const bucket = demandHistoryLabels.length - 1 - Math.floor(diffDays / 7);

  return bucket >= 0 && bucket < demandHistoryLabels.length ? bucket : -1;
}

async function runPythonDemandForecast(products: DemandForecastInput[]) {
  const scriptPath = path.resolve(process.cwd(), "scripts", "demand_forecast.py");

  try {
    return await executePythonForecast("python", scriptPath, products);
  } catch {
    try {
      return await executePythonForecast("python3", scriptPath, products);
    } catch {
      return fallbackDemandForecast(products);
    }
  }
}

function executePythonForecast(command: string, scriptPath: string, products: DemandForecastInput[]) {
  return new Promise<PythonForecast[]>((resolve, reject) => {
    const child = spawn(command, [scriptPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error("Demand forecast timed out"));
    }, 5000);

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      clearTimeout(timeout);

      if (code !== 0) {
        reject(new Error(stderr || "Demand forecast failed"));
        return;
      }

      try {
        const payload = JSON.parse(stdout) as { predictions?: PythonForecast[] };
        resolve(payload.predictions ?? []);
      } catch (error) {
        reject(error);
      }
    });

    child.stdin.write(JSON.stringify({ products }));
    child.stdin.end();
  });
}

function fallbackDemandForecast(products: DemandForecastInput[]): PythonForecast[] {
  return products
    .map((product) => {
      const units = product.history.map((item) => item.units);
      const totalSold = units.reduce((sum, value) => sum + value, 0);
      const recentSold = units.slice(-3).reduce((sum, value) => sum + value, 0);
      const predictedUnits = Math.max(0, Math.ceil(recentSold / 3));

      return {
        productId: product.productId,
        keywords: product.name.toLowerCase().split(/\s+/).slice(0, 4),
        totalSold,
        recentSold,
        predictedUnits,
        trend: "stable" as const,
        confidence: totalSold > 0 ? 70 : 45,
        forecast: [
          { label: "Next 7 days", units: predictedUnits },
          { label: "Next 14 days", units: Math.ceil(predictedUnits * 1.08) },
          { label: "Next 21 days", units: Math.ceil(predictedUnits * 1.15) },
        ],
      };
    })
    .sort((a, b) => b.predictedUnits - a.predictedUnits);
}
