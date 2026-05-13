import { asyncHandler } from "@/utils/async-handler";

import { getDashboardOverview, getDemandForecast } from "./analytics.service";

export const analyticsOverviewController = asyncHandler(async (_req, res) => {
  const data = await getDashboardOverview();

  res.json({
    success: true,
    data,
  });
});

export const demandForecastController = asyncHandler(async (_req, res) => {
  const data = await getDemandForecast();

  res.json({
    success: true,
    data,
  });
});
