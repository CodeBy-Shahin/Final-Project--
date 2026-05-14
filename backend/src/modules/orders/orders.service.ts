import { OrderModel } from "@/models/order.model";
import { ProductModel } from "@/models/product.model";
import { ApiError } from "@/utils/api-error";

type CartItem = {
  productId: string;
  quantity: number;
};

type ShippingAddress = {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  district?: string;
  postalCode?: string;
};

type CreateOrderInput = {
  userId: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod?: "cod" | "card" | "bank";
  notes?: string;
};

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

function generateTrackingNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SC-${timestamp}-${random}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

const trackingCopy: Record<
  string,
  { label: string; description: string; location?: string }
> = {
  pending: {
    label: "Order placed",
    description: "We received the order and are waiting for admin approval.",
    location: "Online store",
  },
  processing: {
    label: "Approved for processing",
    description: "The order has been approved and the products are being packed.",
    location: "Fulfillment center",
  },
  shipped: {
    label: "Out for shipment",
    description: "The parcel has left the warehouse and is moving through the delivery network.",
    location: "Courier hub",
  },
  delivered: {
    label: "Delivered",
    description: "The parcel was delivered to the customer address.",
    location: "Delivery address",
  },
  cancelled: {
    label: "Order cancelled",
    description: "This order was cancelled and will not be shipped.",
    location: "Online store",
  },
};

function createTrackingEvent(status: string) {
  const details = trackingCopy[status] ?? trackingCopy.pending;
  return {
    status,
    label: details.label,
    description: details.description,
    location: details.location,
    createdAt: new Date(),
  };
}

function getTrackingEvents(order: Record<string, unknown>) {
  const events = order.trackingEvents;
  if (Array.isArray(events) && events.length > 0) return events;

  const details = trackingCopy[String(order.status)] ?? trackingCopy.pending;
  return [
    {
      status: order.status,
      label: details.label,
      description: details.description,
      location: details.location,
      createdAt: order.createdAt,
    },
  ];
}

function serializeOrder(order: Record<string, unknown>) {
  return {
    id: String(order._id),
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    total: order.total,
    shippingAddress: order.shippingAddress,
    shipment: order.shipment,
    trackingEvents: getTrackingEvents(order),
    notes: order.notes,
    items: order.items,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export async function createOrder(input: CreateOrderInput) {
  const productIds = input.items.map((i) => i.productId);
  const products = await ProductModel.find({ _id: { $in: productIds } }).lean();

  if (products.length !== input.items.length) {
    throw new ApiError(400, "One or more products not found");
  }

  const orderItems = input.items.map((cartItem) => {
    const product = products.find((p) => String(p._id) === cartItem.productId);
    if (!product) throw new ApiError(400, `Product ${cartItem.productId} not found`);
    return {
      product: product._id,
      productName: product.name,
      quantity: cartItem.quantity,
      unitPrice: product.price,
    };
  });

  const subtotal = orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const shippingFee = subtotal >= 1000 ? 0 : 60;
  const total = subtotal + shippingFee;

  const order = await OrderModel.create({
    orderNumber: generateOrderNumber(),
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    user: input.userId,
    items: orderItems,
    status: "pending",
    paymentMethod: input.paymentMethod ?? "cod",
    paymentStatus: "pending",
    subtotal,
    shippingFee,
    total,
    shippingAddress: input.shippingAddress,
    trackingEvents: [createTrackingEvent("pending")],
    notes: input.notes,
  });

  return serializeOrder(order.toObject());
}

export async function listOrders(options: { userId?: string; role: string; page?: number; limit?: number }) {
  const { userId, role, page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> =
    role === "customer" ? { user: userId } : {};

  const [orders, total] = await Promise.all([
    OrderModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    OrderModel.countDocuments(filter),
  ]);

  return {
    items: orders.map(serializeOrder),
    total,
    page,
    limit,
  };
}

export async function getOrderById(orderId: string, options: { userId?: string; role: string }) {
  const order = await OrderModel.findById(orderId).lean();

  if (!order) throw new ApiError(404, "Order not found");

  if (options.role === "customer" && String(order.user) !== options.userId) {
    throw new ApiError(403, "Access denied");
  }

  return serializeOrder(order);
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  options: { role: string },
) {
  const allowed = ["super_admin", "admin", "vendor"];
  if (!allowed.includes(options.role)) throw new ApiError(403, "Access denied");

  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) throw new ApiError(400, "Invalid status");

  const existingOrder = await OrderModel.findById(orderId).lean();
  if (!existingOrder) throw new ApiError(404, "Order not found");

  const update: Record<string, unknown> = { status };
  if (existingOrder.status !== status) {
    update.$push = { trackingEvents: createTrackingEvent(status) };
  }

  if (status === "shipped" && !existingOrder.shipment?.trackingNumber) {
    update.shipment = {
      carrier: "Smart Courier",
      trackingNumber: generateTrackingNumber(),
      estimatedDelivery: addDays(new Date(), 3),
      currentLocation: "Courier hub",
    };
  }

  if (status === "processing") {
    update["shipment.currentLocation"] = "Fulfillment center";
  }

  if (status === "delivered") {
    update["shipment.currentLocation"] = "Delivery address";
    update["shipment.estimatedDelivery"] = new Date();
  }

  if (status === "cancelled") {
    update["shipment.currentLocation"] = "Order cancelled";
  }

  const order = await OrderModel.findByIdAndUpdate(
    orderId,
    update,
    { new: true },
  ).lean();

  if (!order) throw new ApiError(404, "Order not found");

  return serializeOrder(order);
}
