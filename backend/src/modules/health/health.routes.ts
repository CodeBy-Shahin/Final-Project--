import { Router } from "express";
import mongoose from "mongoose";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      databaseState: mongoose.connection.readyState,
      timestamp: new Date().toISOString(),
    },
  });
});
