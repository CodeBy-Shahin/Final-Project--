import { ZodError } from "zod";

import { logger } from "@/config/logger";
import { ApiError } from "@/utils/api-error";

import type { NextFunction, Request, Response } from "express";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.flatten(),
    });
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details,
    });
    return;
  }

  logger.error("Unexpected server error", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
