import { asyncHandler } from "@/utils/async-handler";

import { getDashboardOverview } from "./analytics.service";

export const analyticsOverviewController = asyncHandler(async (_req, res) => {
  const data = await getDashboardOverview();

  res.json({
    success: true,
    data,
  });
});
