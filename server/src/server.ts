import { createServer } from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/db.js";
import { initSocket } from "./sockets/index.js";
import { logger } from "./utils/logger.js";

const bootstrap = async (): Promise<void> => {
  await connectDatabase();

  const app = createApp();
  const httpServer = createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    logger.info(`Hostely API listening on :${env.PORT}`, { env: env.NODE_ENV });
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down`);
    httpServer.close(() => logger.info("HTTP server closed"));
    await disconnectDatabase();
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
};

bootstrap().catch((err) => {
  logger.error("Failed to bootstrap", { err: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
