import { SESSION_COOKIE_NAME } from "@hostely/shared";
import type { Server as HttpServer } from "node:http";
import { Server as IoServer, type Socket } from "socket.io";
import { env } from "../config/env.js";
import { verifyJwt } from "../utils/jwt.js";
import { logger } from "../utils/logger.js";

/** Lightweight cookie parser for the socket handshake (no Express req here). */
const parseCookieHeader = (header: string | undefined): Record<string, string> => {
  if (!header) return {};
  return header.split(";").reduce<Record<string, string>>((acc, part) => {
    const idx = part.indexOf("=");
    if (idx < 0) return acc;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) acc[k] = decodeURIComponent(v);
    return acc;
  }, {});
};

/**
 * Attach Socket.io to the existing HTTP server.
 * Authenticated via the same HTTP-only session cookie used by REST —
 * falls back to `auth.token` handshake for non-browser clients.
 */
export const initSocket = (httpServer: HttpServer): IoServer => {
  const io = new IoServer(httpServer, {
    cors: { origin: env.CLIENT_ORIGIN, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const cookies = parseCookieHeader(socket.handshake.headers.cookie);
      const token =
        cookies[SESSION_COOKIE_NAME] ?? (socket.handshake.auth?.token as string | undefined);
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
