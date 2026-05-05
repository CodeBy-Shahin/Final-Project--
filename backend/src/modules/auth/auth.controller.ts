import { z } from "zod";

import { asyncHandler } from "@/utils/async-handler";

import { getCurrentUser, loginUser } from "./auth.service";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const loginController = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const result = await loginUser(email, password, req.ip);

  res.json({
    success: true,
    data: result,
  });
});

export const meController = asyncHandler(async (req, res) => {
  const result = await getCurrentUser(req.user!.sub);

  res.json({
    success: true,
    data: result,
  });
});
