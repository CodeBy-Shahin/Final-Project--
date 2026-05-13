import { fallbackDashboardOverview, fallbackProducts, siteConfig } from "@/lib/site";
import { formatPrice, getDiscountPercentage, getStockMessage } from "@/lib/commerce";
import type { Product } from "@/types/domain";

type KnowledgeEntry = {
  id: string;
  title: string;
  type: "project" | "route" | "feature" | "account" | "product" | "admin";
  keywords: string[];
  answer: string;
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "can",
  "do",
  "does",
  "for",
  "how",
  "i",
  "in",
  "is",
  "me",
  "of",
  "on",
  "the",
  "to",
  "what",
  "when",
  "where",
  "which",
  "who",
  "with",
  "you",
  "your",
]);

const SPELLING_FIXES: Record<string, string> = {
  ans: "answer",
  anser: "answer",
  deshboard: "dashboard",
  invetory: "inventory",
  predection: "prediction",
  qsn: "question",
  quesion: "question",
  wroking: "working",
};

const CATEGORY_ALIASES: Record<string, string[]> = {
  "Grocery Essentials": ["grocery", "groceries", "rice", "egg", "eggs", "oil", "food", "pantry"],
  "Home Care": ["home care", "laundry", "detergent", "cleaner", "floor", "cleaning", "home"],
  "Personal Care": ["personal care", "beauty", "shampoo", "face wash", "grooming", "skin", "hair"],
  "Kitchen & Dining": ["kitchen", "dining", "cookware", "pan", "blender", "lunch box", "appliance"],
  "Electronics & Gadgets": ["electronics", "gadgets", "power bank", "lantern", "mobile", "tech"],
  "Fashion & Lifestyle": ["fashion", "lifestyle", "panjabi", "sandals", "footwear", "menswear"],
};

const PROJECT_DATABASE: KnowledgeEntry[] = [
  {
    id: "project-overview",
    title: "Project overview",
    type: "project",
    keywords: ["about", "project", "smart commerce", "ecommerce", "marketplace", "unique", "features"],
    answer: `${siteConfig.name} is a smart multi-role e-commerce platform. It includes a storefront, cart, checkout, customer order tracking, admin analytics, vendor product management, low-stock vendor alerts, demand forecasting, PDF order receipts, audit activity, and role-based dashboards.`,
  },
  {
    id: "customer-flow",
    title: "Customer shopping flow",
    type: "route",
    keywords: ["customer", "buy", "purchase", "cart", "checkout", "confirm order", "order flow"],
    answer:
      "Customer flow: browse products at /products, add items to cart, open /cart, continue to /checkout, enter delivery details, choose payment, and click Confirm order. After confirmation, a PDF receipt downloads and an order confirmation window opens.",
  },
  {
    id: "pdf-receipt",
    title: "PDF receipt",
    type: "feature",
    keywords: ["pdf", "receipt", "invoice", "download", "confirm order", "price"],
    answer:
      "After the customer clicks Confirm order, the checkout generates a PDF receipt with order number, customer details, delivery address, ordered products, item prices, shipping fee, and total price.",
  },
  {
    id: "admin-dashboard",
    title: "Admin dashboard",
    type: "admin",
    keywords: ["admin", "dashboard", "overview", "kpi", "revenue", "audit", "analytics"],
    answer:
      "Admins use /admin to view KPIs, revenue chart, below-stock product alerts, recent orders, audit activity, and top products. Sidebar modules include Orders, Customers, Vendors, Inventory, Low-stock product, Demand forecast, and Catalog.",
  },
  {
    id: "low-stock",
    title: "Low stock product",
    type: "feature",
    keywords: ["low stock", "below stock", "stock alert", "vendor name", "out of stock", "inventory alert"],
    answer:
      "The Low-stock product module is at /admin/low-stock-product. It shows products with stock below 7 units, including product name, vendor name, SKU, current stock, alert threshold, suggested restock quantity, and status.",
  },
  {
    id: "demand-forecast",
    title: "Demand forecast",
    type: "feature",
    keywords: ["demand", "forecast", "prediction", "future", "chart", "python", "nlp", "sell most"],
    answer:
      "The Demand forecast module is at /admin/demand-forecast. It uses previous order sales plus a Python analysis script to estimate which products may sell most in the future, then shows the result with a Recharts chart and ranking table.",
  },
  {
    id: "vendor-dashboard",
    title: "Vendor dashboard",
    type: "route",
    keywords: ["vendor", "seller", "vendor dashboard", "add product", "manage product", "vendor orders"],
    answer:
      "Vendors use /vendor to view overview stats, /vendor/products to manage products, /vendor/products/new to add products, /vendor/inventory to update stock, and /vendor/orders to review order status.",
  },
  {
    id: "inventory",
    title: "Inventory overview",
    type: "feature",
    keywords: ["inventory", "stock", "adjust", "warehouse", "quantity", "reorder"],
    answer:
      "Inventory is managed from /admin/inventory and /vendor/inventory. It shows product stock, reorder points, status badges, and stock adjustment controls. Stock movements are stored in inventory logs.",
  },
  {
    id: "orders",
    title: "Orders",
    type: "feature",
    keywords: ["order", "orders", "status", "tracking", "pending", "processing", "shipped", "delivered"],
    answer:
      "Orders support statuses pending, processing, shipped, delivered, and cancelled. Customers can view their orders from /dashboard/orders, while admins and vendors manage orders from their dashboard order pages.",
  },
  {
    id: "demo-accounts",
    title: "Demo accounts",
    type: "account",
    keywords: ["login", "demo", "account", "password", "credentials", "email"],
    answer:
      "Demo accounts: Admin uses admin@smartcommerce.local / Admin12345. Vendor uses vendor@smartcommerce.local / Vendor1234. Customer uses customer@smartcommerce.local / Customer123.",
  },
  {
    id: "tech-stack",
    title: "Technology stack",
    type: "project",
    keywords: ["technology", "tech stack", "next", "react", "express", "mongodb", "mongoose", "docker", "typescript"],
    answer:
      "The frontend uses Next.js, React, TypeScript, Tailwind CSS, Recharts, and jsPDF. The backend uses Node.js, Express, TypeScript, MongoDB with Mongoose, JWT authentication, Docker, and a Python script for demand forecast analysis.",
  },
  {
    id: "chatbot",
    title: "Rule database chatbot",
    type: "feature",
    keywords: ["chatbot", "chat", "answer", "question", "rule", "database", "support"],
    answer:
      "The chatbot uses rule matching plus a project knowledge database. It can answer project-related questions about products, checkout, PDF receipts, order tracking, admin modules, low-stock alerts, demand forecast, vendor features, demo accounts, tech stack, and setup.",
  },
  {
    id: "run-project",
    title: "Run project",
    type: "project",
    keywords: ["run", "start", "setup", "docker", "install", "localhost", "seed"],
    answer:
      "Run the project with Docker Compose or separate frontend/backend commands. The frontend is usually at http://localhost:3000 and the backend API at http://localhost:5000. Use the seed script to create demo roles, users, categories, products, and orders.",
  },
];

function normalize(value: string) {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned
    .split(" ")
    .map((word) => SPELLING_FIXES[word] ?? word)
    .join(" ");
}

function tokenize(value: string) {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function scoreText(query: string, target: string) {
  const normalizedQuery = normalize(query);
  const normalizedTarget = normalize(target);
  const tokens = tokenize(query);
  let score = 0;

  if (normalizedTarget.includes(normalizedQuery)) {
    score += 10;
  }

  for (const token of tokens) {
    if (normalizedTarget.includes(token)) {
      score += token.length > 4 ? 3 : 2;
    }
  }

  return score;
}

function includesAny(value: string, keywords: string[]) {
  const normalizedValue = normalize(value);

  return keywords.some((keyword) => normalizedValue.includes(normalize(keyword)));
}

function productSearchText(product: Product) {
  return [
    product.name,
    product.sku,
    product.slug,
    product.description,
    product.category?.name,
    product.category?.slug,
    ...product.tags,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatProductInfo(product: Product) {
  const discount = getDiscountPercentage(product);
  const compareAt = product.compareAtPrice ? `, was ${formatPrice(product.compareAtPrice)}` : "";
  const discountText = discount > 0 ? ` (${discount}% off)` : "";

  return [
    product.name,
    `SKU: ${product.sku}`,
    `Category: ${product.category?.name ?? "Uncategorized"}`,
    `Price: ${formatPrice(product.price)}${compareAt}${discountText}`,
    `Stock: ${product.stock} units - ${getStockMessage(product)}`,
    `Rating: ${product.rating}/5`,
    `Details: ${product.description}`,
  ].join("\n");
}

function formatProductList(products: Product[], heading: string) {
  return [
    heading,
    ...products.map((product) => `- ${product.name}: ${formatPrice(product.price)} (${getStockMessage(product)}, stock ${product.stock})`),
  ].join("\n");
}

function answerProductQuestion(message: string) {
  const normalizedMessage = normalize(message);
  const hasProductIntent = includesAny(normalizedMessage, [
    "product",
    "price",
    "stock",
    "available",
    "discount",
    "sale",
    "offer",
    "featured",
    "popular",
    "category",
    "categories",
    "sell",
    "buy",
    "grocery",
    "rice",
    "egg",
    "oil",
    "detergent",
    "shampoo",
    "blender",
    "power bank",
    "lantern",
    "panjabi",
    "sandals",
  ]);

  if (!hasProductIntent) {
    return null;
  }

  if (normalizedMessage.includes("discount") || normalizedMessage.includes("sale") || normalizedMessage.includes("offer")) {
    const products = fallbackProducts
      .filter((product) => getDiscountPercentage(product) > 0)
      .sort((a, b) => getDiscountPercentage(b) - getDiscountPercentage(a))
      .slice(0, 6);

    return formatProductList(products, "Current discounted products:");
  }

  if (normalizedMessage.includes("featured") || normalizedMessage.includes("popular") || normalizedMessage.includes("top")) {
    return formatProductList(fallbackProducts.filter((product) => product.featured).slice(0, 6), "Featured products:");
  }

  if (normalizedMessage.includes("category") || normalizedMessage.includes("what do you sell")) {
    const categories = [...new Set(fallbackProducts.map((product) => product.category?.name).filter(Boolean))];
    return `Smart Commerce sells products in these categories:\n${categories.map((category) => `- ${category}`).join("\n")}`;
  }

  const category = Object.entries(CATEGORY_ALIASES).find(([categoryName, aliases]) => {
    return normalize(categoryName).includes(normalizedMessage) || aliases.some((alias) => normalizedMessage.includes(normalize(alias)));
  })?.[0];

  if (category) {
    return formatProductList(
      fallbackProducts.filter((product) => product.category?.name === category),
      `${category} products:`,
    );
  }

  const bestProduct = fallbackProducts
    .map((product) => ({ product, score: scoreText(message, productSearchText(product)) }))
    .sort((a, b) => b.score - a.score)[0];

  if (bestProduct && bestProduct.score >= 4) {
    return formatProductInfo(bestProduct.product);
  }

  if (["product", "price", "stock", "available"].some((keyword) => normalizedMessage.includes(keyword))) {
    return formatProductList(fallbackProducts.slice(0, 8), "Available products:");
  }

  return null;
}

function answerProjectQuestion(message: string) {
  const normalizedMessage = normalize(message);
  const hasProjectIntent = includesAny(normalizedMessage, [
    "project",
    "feature",
    "unique",
    "dashboard",
    "admin",
    "vendor",
    "customer",
    "checkout",
    "order",
    "pdf",
    "receipt",
    "invoice",
    "low stock",
    "below stock",
    "demand",
    "forecast",
    "prediction",
    "python",
    "chatbot",
    "login",
    "account",
    "technology",
    "tech",
    "run",
    "setup",
    "docker",
  ]);

  if (!hasProjectIntent) {
    return null;
  }

  const bestEntry = PROJECT_DATABASE.map((entry) => ({
    entry,
    score: scoreText(message, `${entry.title} ${entry.type} ${entry.keywords.join(" ")} ${entry.answer}`),
  })).sort((a, b) => b.score - a.score)[0];

  if (bestEntry && bestEntry.score >= 5) {
    return bestEntry.entry.answer;
  }

  return null;
}

function answerStatsQuestion(message: string) {
  const normalizedMessage = normalize(message);

  if (!normalizedMessage.includes("dashboard") && !normalizedMessage.includes("metric") && !normalizedMessage.includes("low stock")) {
    return null;
  }

  if (normalizedMessage.includes("low stock")) {
    return formatProductList(
      fallbackDashboardOverview.inventoryAlerts.map((alert) => ({
        ...fallbackProducts[0],
        id: alert.id,
        name: `${alert.name} by ${alert.vendorName}`,
        sku: alert.sku,
        stock: alert.stock,
        reorderPoint: alert.threshold ?? 7,
      })),
      "Current low-stock alerts:",
    );
  }

  return [
    "Admin dashboard sample metrics:",
    ...fallbackDashboardOverview.kpis.map((metric) => `- ${metric.label}: ${metric.value} (${metric.delta})`),
  ].join("\n");
}

export function answerChatbotQuestion(question: string) {
  const trimmedQuestion = question.trim();

  if (!trimmedQuestion) {
    return "Please type a question about products, orders, dashboards, inventory, low stock, demand forecast, accounts, or setup.";
  }

  return (
    answerStatsQuestion(trimmedQuestion) ??
    answerProjectQuestion(trimmedQuestion) ??
    answerProductQuestion(trimmedQuestion) ??
    [
      "I answer using the Smart Commerce project database and rule matching. You can ask about:",
      "- product price, stock, categories, offers, or featured products",
      "- checkout, PDF receipt, order tracking, or payment",
      "- admin, vendor, customer dashboards",
      "- low-stock product and demand forecast modules",
      "- demo login accounts or project setup",
    ].join("\n")
  );
}
