import "dotenv/config";

import { z } from "zod";

const optionalEnvString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().min(1).optional(),
);

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z.string().min(1),
  MongoDB_fallback: optionalEnvString,
  mongo_fallback: optionalEnvString,
  MONGO_FALLBACK: optionalEnvString,
  MONGODB_FALLBACK_URI: optionalEnvString,
  MONGODB_SECONDARY_URI: optionalEnvString,
  MONGODB_URI_SECONDARY: optionalEnvString,
  MONGODB_URI_2: optionalEnvString,
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  CLIENT_URL: z.string().url().default("http://localhost:3000"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

export const env = envSchema.parse({
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI,
  MongoDB_fallback: process.env.MongoDB_fallback,
  mongo_fallback: process.env.mongo_fallback,
  MONGO_FALLBACK: process.env.MONGO_FALLBACK,
  MONGODB_FALLBACK_URI: process.env.MONGODB_FALLBACK_URI,
  MONGODB_SECONDARY_URI: process.env.MONGODB_SECONDARY_URI,
  MONGODB_URI_SECONDARY: process.env.MONGODB_URI_SECONDARY,
  MONGODB_URI_2: process.env.MONGODB_URI_2,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  CLIENT_URL: process.env.CLIENT_URL,
  LOG_LEVEL: process.env.LOG_LEVEL,
});
