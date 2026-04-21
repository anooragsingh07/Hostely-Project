import type { Server as HttpServer } from "node:http";
import { Server as IoServer, type Socket } from "socket.io";
import { env } from "../config/env.js";
import { verifyJwt } from "../utils/jwt.js";
import { logger } from "../utils/logger.js";

/**
 * Attach Socket.io to the existing HTTP server.
 * Authenticated via `auth.token` handshake — same JWT as REST.
 */
export const initSocket = (httpServer: HttpServer): IoServer => {
  const io = new IoServer(httpServer, {
    cors: { origin: env.CLIENT_ORIGIN, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error("Missing token"));
      const payload = verifyJwt(token);
      socket.data.user = payload;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user as { sub: string };
    logger.info("socket connected", { userId: user.sub, id: socket.id });

    socket.on("disconnect", () => {
      logger.info("socket disconnected", { id: socket.id });
    });
  });

  return io;
};
