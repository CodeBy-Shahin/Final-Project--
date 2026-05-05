import { Router } from "express";

import { authenticate } from "@/middleware/authenticate";
import { authorize } from "@/middleware/authorize";

import {
  createVendorController,
  getUserController,
  listUsersController,
  updateUserStatusController,
} from "./users.controller";

export const usersRouter = Router();

usersRouter.use(authenticate);
usersRouter.use(authorize(["super_admin", "admin"]));

usersRouter.get("/", listUsersController);
usersRouter.post("/vendors", createVendorController);
usersRouter.get("/:id", getUserController);
usersRouter.patch("/:id/status", updateUserStatusController);
