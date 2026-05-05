import { connectToDatabase } from "@/config/database";
import { env } from "@/config/env";
import { logger } from "@/config/logger";

import { createApp } from "./app";

async function startServer() {
  await connectToDatabase();

  const app = createApp();

  

  app.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}`);
  });
}

void startServer().catch((error) => {
  logger.error("Failed to start server", error);
  process.exit(1);
});
