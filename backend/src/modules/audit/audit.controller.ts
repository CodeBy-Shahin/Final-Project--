import { z } from "zod";

import { AuditLogModel } from "@/models/audit-log.model";
import { asyncHandler } from "@/utils/async-handler";

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const listAuditLogsController = asyncHandler(async (req, res) => {
  const { limit } = querySchema.parse(req.query);

  const items = await AuditLogModel.find().sort({ createdAt: -1 }).limit(limit).lean();

  res.json({
    success: true,
    data: items.map((log) => ({
      id: String(log._id),
      actorEmail: log.actorEmail,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      status: log.status,
      createdAt: log.createdAt,
      metadata: log.metadata,
    })),
  });
});
