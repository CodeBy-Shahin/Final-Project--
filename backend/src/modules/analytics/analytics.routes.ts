import { Router } from "express";

import { authenticate } from "@/middleware/authenticate";
import { authorize } from "@/middleware/authorize";

import { analyticsOverviewController, demandForecastController } from "./analytics.controller";

export const analyticsRouter = Router();

analyticsRouter.get("/overview", authenticate, authorize(["super_admin", "admin"]), analyticsOverviewController);
analyticsRouter.get(
  "/demand-forecast",
  authenticate,
  authorize(["super_admin", "admin"]),
  demandForecastController,
);
