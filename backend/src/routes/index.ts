import { Router } from "express";

import { analyticsRouter } from "@/modules/analytics/analytics.routes";
import { auditRouter } from "@/modules/audit/audit.routes";
import { authRouter } from "@/modules/auth/auth.routes";
import { healthRouter } from "@/modules/health/health.routes";
import { ordersRouter } from "@/modules/orders/orders.routes";
import { productsRouter } from "@/modules/products/products.routes";
import { usersRouter } from "@/modules/users/users.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/analytics", analyticsRouter);
apiRouter.use("/audit", auditRouter);
