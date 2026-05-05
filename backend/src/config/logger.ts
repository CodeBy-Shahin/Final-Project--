import { env } from "./env";

type LogLevel = "error" | "warn" | "info" | "debug";

const levelWeights: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function shouldLog(level: LogLevel) {
  return levelWeights[level] <= levelWeights[env.LOG_LEVEL];
}

export const logger = {
  error(message: string, meta?: unknown) {
    if (shouldLog("error")) {
      console.error(`[error] ${message}`, meta ?? "");
    }
  },
  warn(message: string, meta?: unknown) {
    if (shouldLog("warn")) {
      console.warn(`[warn] ${message}`, meta ?? "");
    }
  },
  info(message: string, meta?: unknown) {
    if (shouldLog("info")) {
      console.info(`[info] ${message}`, meta ?? "");
    }
  },
  debug(message: string, meta?: unknown) {
    if (shouldLog("debug")) {
      console.debug(`[debug] ${message}`, meta ?? "");
    }
  },
};
