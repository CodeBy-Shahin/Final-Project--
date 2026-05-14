export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  reorderPoint: number;
  rating: number;
  featured: boolean;
  status?: string;
  tags: string[];
  images: string[];
  metrics: {
    sales30d: number;
    views30d: number;
    conversionRate: number;
  };
  category: Category | null;
  related?: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    rating: number;
    images: string[];
  }>;
};

export type DashboardMetric = {
  label: string;
  value: string;
  delta: string;
  tone: "neutral" | "success" | "warning";
};

export type InventoryAlert = {
  id: string;
  name: string;
  vendorName: string;
  sku: string;
  stock: number;
  reorderPoint: number;
  threshold?: number;
  urgency: "critical" | "high" | "watch";
  recommendedOrderQty: number;
};

export type OrderSummary = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt?: string;
  shipment?: {
    carrier?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    currentLocation?: string;
  };
  trackingEvents?: Array<{
    status: string;
    label: string;
    description: string;
    location?: string;
    createdAt: string;
  }>;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  shippingAddress?: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    district?: string;
    postalCode?: string;
  };
};

export type AuditEntry = {
  id: string;
  actorEmail: string;
  action: string;
  entityType: string;
  status: string;
  createdAt: string;
};

export type TopProductInsight = {
  id: string;
  name: string;
  sales30d: number;
  views30d: number;
  conversionRate: number;
  stock: number;
};

export type RevenuePoint = {
  label: string;
  revenue: number;
  orders: number;
};

export type DashboardOverview = {
  kpis: DashboardMetric[];
  revenueSeries: RevenuePoint[];
  inventoryAlerts: InventoryAlert[];
  topProducts: TopProductInsight[];
  recentOrders: OrderSummary[];
  auditActivity: AuditEntry[];
};

export type DemandForecastItem = {
  productId: string;
  name: string;
  vendorName: string;
  keywords: string[];
  totalSold: number;
  recentSold: number;
  predictedUnits: number;
  trend: "rising" | "stable" | "cooling";
  confidence: number;
  history: Array<{ label: string; units: number }>;
  forecast: Array<{ label: string; units: number }>;
};

export type DemandForecast = {
  generatedAt: string;
  horizon: string;
  items: DemandForecastItem[];
};
