import { Router } from "express";

import { authenticate } from "@/middleware/authenticate";
import { authorize } from "@/middleware/authorize";

import { listAuditLogsController } from "./audit.controller";

export const auditRouter = Router();

auditRouter.get("/logs", authenticate, authorize(["super_admin", "admin"]), listAuditLogsController);
