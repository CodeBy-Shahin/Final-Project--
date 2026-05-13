import bcrypt from "bcryptjs";

import { connectToDatabase, disconnectFromDatabase } from "@/config/database";
import { logger } from "@/config/logger";
import { AuditLogModel } from "@/models/audit-log.model";
import { CategoryModel } from "@/models/category.model";
import { OrderModel } from "@/models/order.model";
import { ProductModel } from "@/models/product.model";
import { RoleModel } from "@/models/role.model";
import { UserModel } from "@/models/user.model";

async function seed() {
  await connectToDatabase();

  const roles = [
    {
      name: "super_admin",
      description: "Full platform control",
      permissions: ["*"],
    },
    {
      name: "admin",
      description: "Operations and merchandising access",
      permissions: ["products.manage", "orders.manage", "analytics.read", "audit.read"],
    },
    {
      name: "inventory_manager",
      description: "Inventory and warehouse workflows",
      permissions: ["inventory.manage", "analytics.read"],
    },
    {
      name: "analyst",
      description: "Analytics and forecasting visibility",
      permissions: ["analytics.read", "forecast.read"],
    },
    {
      name: "vendor",
      description: "Vendor / seller account access",
      permissions: ["products.manage", "orders.manage:self", "catalog.read"],
    },
    {
      name: "customer",
      description: "Customer account access",
      permissions: ["catalog.read", "orders.create", "orders.read:self"],
    },
  ];

  for (const role of roles) {
    await RoleModel.updateOne({ name: role.name }, { $set: role }, { upsert: true });
  }

  const superAdminRole = await RoleModel.findOne({ name: "super_admin" });
  const customerRole = await RoleModel.findOne({ name: "customer" });
  const vendorRole = await RoleModel.findOne({ name: "vendor" });

  if (!superAdminRole || !customerRole || !vendorRole) {
    throw new Error("Required roles were not created");
  }

  const adminPasswordHash = await bcrypt.hash("Admin12345", 10);

  const adminUser = await UserModel.findOneAndUpdate(
    { email: "admin@smartcommerce.local" },
    {
      $set: {
        name: "Platform Administrator",
        email: "admin@smartcommerce.local",
        passwordHash: adminPasswordHash,
        role: superAdminRole._id,
        status: "active",
      },
    },
    { new: true, upsert: true },
  );

  const demoCustomer = await UserModel.findOneAndUpdate(
    { email: "customer@smartcommerce.local" },
    {
      $set: {
        name: "Demo Customer",
        email: "customer@smartcommerce.local",
        passwordHash: await bcrypt.hash("Customer123", 10),
        role: customerRole._id,
        status: "active",
      },
    },
    { new: true, upsert: true },
  );

  const demoVendor = await UserModel.findOneAndUpdate(
    { email: "vendor@smartcommerce.local" },
    {
      $set: {
        name: "Demo Vendor",
        email: "vendor@smartcommerce.local",
        passwordHash: await bcrypt.hash("Vendor1234", 10),
        role: vendorRole._id,
        status: "active",
      },
    },
    { new: true, upsert: true },
  );

  const categories = [
    {
      name: "Grocery Essentials",
      slug: "grocery-essentials",
      description: "Daily pantry staples, breakfast basics, and family meal essentials.",
    },
    {
      name: "Home Care",
      slug: "home-care",
      description: "Laundry, cleaning, and household maintenance picks for modern homes.",
    },
    {
      name: "Personal Care",
      slug: "personal-care",
      description: "Beauty and grooming products built for everyday routines.",
    },
    {
      name: "Kitchen & Dining",
      slug: "kitchen-dining",
      description: "Cookware, lunch solutions, and compact home appliances.",
    },
    {
      name: "Electronics & Gadgets",
      slug: "electronics-gadgets",
      description: "Useful tech accessories and practical household electronics.",
    },
    {
      name: "Fashion & Lifestyle",
      slug: "fashion-lifestyle",
      description: "Everyday style, footwear, and giftable lifestyle picks.",
    },
  ];

  const categoryMap = new Map<string, string>();

  for (const category of categories) {
    const savedCategory = await CategoryModel.findOneAndUpdate(
      { slug: category.slug },
      { $set: category },
      { new: true, upsert: true },
    );

    categoryMap.set(category.slug, savedCategory.id);
  }

  const products = [
    {
      name: "Premium Basmati Rice 5kg",
      slug: "premium-basmati-rice-5kg",
      sku: "GR-RC-001",
      description:
        "Long-grain aromatic rice selected for family meals, festive biryani, and weekly pantry refills.",
      categorySlug: "grocery-essentials",
      price: 890,
      compareAtPrice: 980,
      stock: 44,
      reorderPoint: 18,
      rating: 4.7,
      featured: true,
      tags: ["rice", "grocery", "daily-essentials"],
      images: [
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80",
      ],
      metrics: {
        sales30d: 286,
        views30d: 4280,
        conversionRate: 6.1,
      },
    },
    {
      name: "Fresh Farm Eggs 12pcs",
      slug: "fresh-farm-eggs-12pcs",
      sku: "GR-EG-002",
      description:
        "Clean, carefully packed eggs for everyday breakfasts, baking, and healthy family meals.",
      categorySlug: "grocery-essentials",
      price: 195,
      compareAtPrice: 220,
      stock: 62,
      reorderPoint: 24,
      rating: 4.8,
      featured: true,
      tags: ["eggs", "grocery", "fresh"],
      images: [
        "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=1200&q=80",
      ],
      metrics: {
        sales30d: 352,
        views30d: 5140,
        conversionRate: 6.8,
      },
    },
    {
      name: "Cold Pressed Mustard Oil 1L",
      slug: "cold-pressed-mustard-oil-1l",
      sku: "GR-OL-003",
      description:
        "Rich, punchy mustard oil packed for traditional cooking, curries, and everyday frying.",
      categorySlug: "grocery-essentials",
      price: 260,
      compareAtPrice: 300,
      stock: 51,
      reorderPoint: 20,
      rating: 4.6,
      featured: true,
      tags: ["oil", "grocery", "cooking"],
      images: [
        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1200&q=80",
      ],
      metrics: {
        sales30d: 224,
        views30d: 3680,
        conversionRate: 5.4,
      },
    },
    {
      name: "Family Laundry Detergent 3kg",
      slug: "family-laundry-detergent-3kg",
      sku: "HC-DT-004",
      description:
        "Deep-clean detergent built for family-size washing loads with long-lasting freshness.",
      categorySlug: "home-care",
      price: 640,
      compareAtPrice: 760,
      stock: 31,
      reorderPoint: 14,
      rating: 4.5,
      featured: true,
      tags: ["detergent", "home-care", "laundry"],
      images: [
        "https://images.unsplash.com/photo-1583947582886-f40ec95dd752?auto=format&fit=crop&w=1200&q=80",
      ],
      metrics: {
        sales30d: 174,
        views30d: 2940,
        conversionRate: 5.1,
      },
    },
    {
      name: "Citrus Floor Cleaner 2L",
      slug: "citrus-floor-cleaner-2l",
      sku: "HC-FC-005",
      description:
        "A bright, clean-smelling floor cleaner that keeps tiles and hard surfaces fresh.",
      categorySlug: "home-care",
      price: 390,
      compareAtPrice: 450,
      stock: 26,
      reorderPoint: 12,
      rating: 4.4,
      featured: false,
      tags: ["cleaner", "home-care", "floor"],
      images: [
        "https://images.unsplash.com/photo-1584473457493-17c4a1e74a48?auto=format&fit=crop&w=1200&q=80",
      ],
      metrics: {
        sales30d: 128,
        views30d: 2140,
        conversionRate: 4.8,
      },
    },
    {
      name: "Herbal Repair Shampoo 650ml",
      slug: "herbal-repair-shampoo-650ml",
      sku: "PC-SH-006",
      description:
        "Salon-style repair shampoo with herbal extracts for soft, manageable daily hair care.",
      categorySlug: "personal-care",
      price: 520,
      compareAtPrice: 610,
      stock: 48,
      reorderPoint: 16,
      rating: 4.6,
      featured: true,
      tags: ["shampoo", "beauty", "personal-care"],
      images: [
        "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=1200&q=80",
      ],
      metrics: {
        sales30d: 189,
        views30d: 3380,
        conversionRate: 5.6,
      },
    },
    {
      name: "Aloe Vera Face Wash",
      slug: "aloe-vera-face-wash",
      sku: "PC-FW-007",
      description:
        "Lightweight daily face wash that keeps skin fresh, calm, and clean after long days outside.",
      categorySlug: "personal-care",
      price: 350,
      compareAtPrice: 420,
      stock: 40,
      reorderPoint: 15,
      rating: 4.5,
      featured: false,
      tags: ["face-wash", "beauty", "personal-care"],
      images: [
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80",
      ],
      metrics: {
        sales30d: 141,
        views30d: 2490,
        conversionRate: 5.3,
      },
    },
    {
      name: "Stainless Steel Lunch Box",
      slug: "stainless-steel-lunch-box",
      sku: "KD-LB-008",
      description:
        "Compact insulated lunch box for office meals, school snacks, and everyday carrying convenience.",
      categorySlug: "kitchen-dining",
      price: 780,
      compareAtPrice: 980,
      stock: 22,
      reorderPoint: 10,
      rating: 4.7,
      featured: false,
      tags: ["lunch-box", "kitchen", "daily-use"],
      images: [
        "https://images.unsplash.com/photo-1520085601670-ee14aa5fa3e8?auto=format&fit=crop&w=1200&q=80",
      ],
      metrics: {
        sales30d: 116,
        views30d: 1940,
        conversionRate: 4.9,
      },
    },
    {
      name: "Non-Stick Fry Pan 28cm",
      slug: "non-stick-fry-pan-28cm",
      sku: "KD-FP-009",
      description:
        "Everyday fry pan with easy-clean coating for quick breakfasts and weeknight cooking.",
      categorySlug: "kitchen-dining",
      price: 1450,
      compareAtPrice: 1690,
      stock: 18,
      reorderPoint: 8,
      rating: 4.6,
      featured: true,
      tags: ["cookware", "kitchen", "pan"],
      images: [
        "https://images.unsplash.com/photo-1584990347449-8d28f2e714ad?auto=format&fit=crop&w=1200&q=80",
      ],
      metrics: {
        sales30d: 104,
        views30d: 1860,
        conversionRate: 4.4,
      },
    },
    {
      name: "FastCharge Power Bank 20000mAh",
      slug: "fastcharge-power-bank-20000mah",
      sku: "EL-PB-010",
      description:
        "High-capacity fast-charging power bank for heavy phone users, travel days, and load-shedding backup.",
      categorySlug: "electronics-gadgets",
      price: 2190,
      compareAtPrice: 2590,
      stock: 4,
      reorderPoint: 8,
      rating: 4.8,
      featured: true,
      tags: ["power-bank", "electronics", "mobile"],
      images: [
        "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80",
      ],
      metrics: {
        sales30d: 132,
        views30d: 2680,
        conversionRate: 4.9,
      },
    },
    {
      name: "Emergency LED Lantern",
      slug: "emergency-led-lantern",
      sku: "EL-LN-011",
      description:
        "Portable rechargeable lantern built for power cuts, evening errands, and backup home lighting.",
      categorySlug: "electronics-gadgets",
      price: 1280,
      compareAtPrice: 1490,
      stock: 27,
      reorderPoint: 10,
      rating: 4.5,
      featured: false,
      tags: ["lantern", "electronics", "emergency"],
      images: [
        "https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?auto=format&fit=crop&w=1200&q=80",
      ],
      metrics: {
        sales30d: 96,
        views30d: 1540,
        conversionRate: 4.2,
      },
    },
    {
      name: "Everyday Cotton Panjabi",
      slug: "everyday-cotton-panjabi",
      sku: "FS-PJ-012",
      description:
        "Light, breathable panjabi for family gatherings, Friday wear, and everyday festive styling.",
      categorySlug: "fashion-lifestyle",
      price: 1690,
      compareAtPrice: 1990,
      stock: 21,
      reorderPoint: 9,
      rating: 4.7,
      featured: true,
      tags: ["fashion", "panjabi", "menswear"],
      images: [
        "https://images.unsplash.com/photo-1618886614638-80e3c103d31a?auto=format&fit=crop&w=1200&q=80",
      ],
      metrics: {
        sales30d: 111,
        views30d: 2020,
        conversionRate: 4.6,
      },
    },
    {
      name: "Comfort Slide Sandals",
      slug: "comfort-slide-sandals",
      sku: "FS-SD-013",
      description:
        "Soft cushioned sandals designed for home, errands, and all-day casual comfort.",
      categorySlug: "fashion-lifestyle",
      price: 990,
      compareAtPrice: 1250,
      stock: 36,
      reorderPoint: 14,
      rating: 4.4,
      featured: false,
      tags: ["fashion", "sandals", "footwear"],
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      ],
      metrics: {
        sales30d: 88,
        views30d: 1700,
        conversionRate: 4.1,
      },
    },
    {
      name: "Compact Kitchen Blender 1.5L",
      slug: "compact-kitchen-blender-1-5l",
      sku: "KD-BL-014",
      description:
        "A reliable everyday blender for smoothies, spice pastes, sauces, and quick kitchen prep.",
      categorySlug: "kitchen-dining",
      price: 2890,
      compareAtPrice: 3390,
      stock: 0,
      reorderPoint: 6,
      rating: 4.6,
      featured: false,
      tags: ["blender", "kitchen", "appliances"],
      images: [
        "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=1200&q=80",
      ],
      metrics: {
        sales30d: 74,
        views30d: 1430,
        conversionRate: 3.9,
      },
    },
  ];

  const savedProducts = [];

  for (const product of products) {
    const categoryId = categoryMap.get(product.categorySlug);

    if (!categoryId) {
      throw new Error(`Missing category for ${product.name}`);
    }

    const savedProduct = await ProductModel.findOneAndUpdate(
      { slug: product.slug },
      {
        $set: {
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          description: product.description,
          category: categoryId,
          vendor: demoVendor._id,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          stock: product.stock,
          reorderPoint: product.reorderPoint,
          rating: product.rating,
          featured: product.featured,
          tags: product.tags,
          images: product.images,
          metrics: product.metrics,
          status: "active",
        },
      },
      { new: true, upsert: true },
    );

    savedProducts.push(savedProduct);
  }

  if ((await OrderModel.countDocuments()) === 0) {
    const orderSeeds = [
      {
        orderNumber: "ORD-2026-001",
        customerName: "Aisha Rahman",
        customerEmail: "aisha@example.com",
        status: "delivered",
        paymentStatus: "paid",
        paymentMethod: "cod",
        items: [savedProducts[0], savedProducts[1]],
      },
      {
        orderNumber: "ORD-2026-002",
        customerName: "Tariq Mahmud",
        customerEmail: "tariq@example.com",
        status: "processing",
        paymentStatus: "pending",
        paymentMethod: "cod",
        items: [savedProducts[3], savedProducts[4]],
      },
      {
        orderNumber: "ORD-2026-003",
        customerName: "Nabila Sultana",
        customerEmail: "nabila@example.com",
        status: "shipped",
        paymentStatus: "paid",
        paymentMethod: "card",
        items: [savedProducts[5], savedProducts[6]],
      },
      {
        orderNumber: "ORD-2026-004",
        customerName: "Rifat Hossain",
        customerEmail: "rifat@example.com",
        status: "delivered",
        paymentStatus: "paid",
        paymentMethod: "card",
        items: [savedProducts[9]],
      },
      {
        orderNumber: "ORD-2026-005",
        customerName: "Sadia Karim",
        customerEmail: "sadia@example.com",
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: "cod",
        items: [savedProducts[11], savedProducts[12]],
      },
    ];

    for (const [index, order] of orderSeeds.entries()) {
      const items = order.items.map((product, itemIndex) => ({
        product: product._id,
        productName: product.name,
        quantity: itemIndex === 0 ? 1 : 2,
        unitPrice: product.price,
      }));

      const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const shippingFee = index % 2 === 0 ? 60 : 80;

      await OrderModel.create({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        user: demoCustomer._id,
        items,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        subtotal,
        shippingFee,
        total: subtotal + shippingFee,
      });
    }
  }

  const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const forecastOrderSeeds = [
    {
      orderNumber: "FCAST-2026-W5-001",
      customerName: "Forecast Demo W5",
      customerEmail: "forecast-w5@example.com",
      status: "delivered",
      paymentStatus: "paid",
      createdAt: daysAgo(35),
      items: [
        { product: savedProducts[1], quantity: 3 },
        { product: savedProducts[0], quantity: 6 },
        { product: savedProducts[13], quantity: 8 },
      ],
    },
    {
      orderNumber: "FCAST-2026-W4-001",
      customerName: "Forecast Demo W4",
      customerEmail: "forecast-w4@example.com",
      status: "delivered",
      paymentStatus: "paid",
      createdAt: daysAgo(28),
      items: [
        { product: savedProducts[1], quantity: 5 },
        { product: savedProducts[0], quantity: 6 },
        { product: savedProducts[13], quantity: 6 },
      ],
    },
    {
      orderNumber: "FCAST-2026-W3-001",
      customerName: "Forecast Demo W3",
      customerEmail: "forecast-w3@example.com",
      status: "delivered",
      paymentStatus: "paid",
      createdAt: daysAgo(21),
      items: [
        { product: savedProducts[1], quantity: 8 },
        { product: savedProducts[0], quantity: 7 },
        { product: savedProducts[13], quantity: 5 },
      ],
    },
    {
      orderNumber: "FCAST-2026-W2-001",
      customerName: "Forecast Demo W2",
      customerEmail: "forecast-w2@example.com",
      status: "shipped",
      paymentStatus: "paid",
      createdAt: daysAgo(14),
      items: [
        { product: savedProducts[1], quantity: 12 },
        { product: savedProducts[0], quantity: 6 },
        { product: savedProducts[13], quantity: 3 },
      ],
    },
    {
      orderNumber: "FCAST-2026-W1-001",
      customerName: "Forecast Demo W1",
      customerEmail: "forecast-w1@example.com",
      status: "processing",
      paymentStatus: "pending",
      createdAt: daysAgo(7),
      items: [
        { product: savedProducts[1], quantity: 16 },
        { product: savedProducts[0], quantity: 7 },
        { product: savedProducts[13], quantity: 2 },
      ],
    },
    {
      orderNumber: "FCAST-2026-CURRENT-001",
      customerName: "Forecast Demo Current",
      customerEmail: "forecast-current@example.com",
      status: "delivered",
      paymentStatus: "paid",
      createdAt: daysAgo(1),
      items: [
        { product: savedProducts[1], quantity: 20 },
        { product: savedProducts[0], quantity: 6 },
        { product: savedProducts[13], quantity: 1 },
        { product: savedProducts[9], quantity: 7 },
      ],
    },
  ];

  for (const order of forecastOrderSeeds) {
    const items = order.items.map(({ product, quantity }) => ({
      product: product._id,
      productName: product.name,
      quantity,
      unitPrice: product.price,
    }));
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const shippingFee = 60;

    await OrderModel.replaceOne(
      { orderNumber: order.orderNumber },
      {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        user: demoCustomer._id,
        items,
        status: order.status,
        paymentMethod: "cod",
        paymentStatus: order.paymentStatus,
        subtotal,
        shippingFee,
        total: subtotal + shippingFee,
        createdAt: order.createdAt,
        updatedAt: order.createdAt,
      },
      { upsert: true, timestamps: false },
    );
  }

  if ((await AuditLogModel.countDocuments()) === 0) {
    await AuditLogModel.insertMany([
      {
        actor: adminUser._id,
        actorEmail: adminUser.email,
        action: "products.created",
        entityType: "product",
        entityId: savedProducts[0].id,
        status: "success",
        metadata: { sku: savedProducts[0].sku },
      },
      {
        actor: adminUser._id,
        actorEmail: adminUser.email,
        action: "inventory.threshold_adjusted",
        entityType: "product",
        entityId: savedProducts[9].id,
        status: "success",
        metadata: { from: 6, to: 8 },
      },
      {
        actor: adminUser._id,
        actorEmail: adminUser.email,
        action: "analytics.overview_viewed",
        entityType: "dashboard",
        entityId: "overview",
        status: "success",
      },
    ]);
  }

  logger.info("Seed completed");
}

void seed()
  .catch((error) => {
    logger.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectFromDatabase();
  });
