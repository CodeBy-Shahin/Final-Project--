import mongoose from "mongoose";

import { env } from "./env";
import { logger } from "./logger";

let connectionPromise: Promise<typeof mongoose.connection> | null = null;

type DatabaseUriCandidate = {
  label: string;
  uri: string;
};

function getDatabaseUriCandidates(): DatabaseUriCandidate[] {
  const candidates: DatabaseUriCandidate[] = [
    { label: "MongoDB_fallback URI", uri: env.MongoDB_fallback ?? "" },
    { label: "mongo_fallback URI", uri: env.mongo_fallback ?? "" },
    { label: "MONGO_FALLBACK URI", uri: env.MONGO_FALLBACK ?? "" },
    { label: "fallback MongoDB URI", uri: env.MONGODB_FALLBACK_URI ?? "" },
    { label: "primary MongoDB URI", uri: env.MONGODB_URI },
    { label: "secondary MongoDB URI", uri: env.MONGODB_SECONDARY_URI ?? "" },
    { label: "secondary MongoDB URI", uri: env.MONGODB_URI_SECONDARY ?? "" },
    { label: "secondary MongoDB URI", uri: env.MONGODB_URI_2 ?? "" },
  ];

  const seen = new Set<string>();

  return candidates.filter((candidate) => {
    if (!candidate.uri || seen.has(candidate.uri)) {
      return false;
    }

    seen.add(candidate.uri);
    return true;
  });
}

async function connectWithFallback() {
  const candidates = getDatabaseUriCandidates();

  for (const [index, candidate] of candidates.entries()) {
    try {
      await mongoose.connect(candidate.uri, {
        autoIndex: env.NODE_ENV !== "production",
      });

      logger.info(`Connected to MongoDB with ${candidate.label}`);
      return mongoose.connection;
    } catch {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }

      const hasNextCandidate = index < candidates.length - 1;

      if (hasNextCandidate) {
        logger.warn(`${candidate.label} failed; trying next configured MongoDB URI`);
      } else {
        logger.error(`${candidate.label} failed`);
      }
    }
  }

  throw new Error("Unable to connect to MongoDB with any configured URI");
}

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = connectWithFallback().finally(() => {
      connectionPromise = null;
    });
  }

  return connectionPromise;
}

export async function disconnectFromDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
