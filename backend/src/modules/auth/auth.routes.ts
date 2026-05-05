import { Router } from "express";

import { authenticate } from "@/middleware/authenticate";

import { loginController, meController } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/login", loginController);
authRouter.get("/me", authenticate, meController);
