import {
  SESSION_COOKIE_NAME,
  SOCKET_EVENTS,
  userRoom,
  type SendChatMessagePayload,
} from "@hostely/shared";
import type { Server as HttpServer } from "node:http";
import { Server as IoServer, type Socket } from "socket.io";
import { env } from "../config/env.js";
import { chatService } from "../modules/chat/chat.service.js";
import { AppError } from "../utils/AppError.js";
import { verifyJwt } from "../utils/jwt.js";
import { logger } from "../utils/logger.js";
import { setIo } from "./bus.js";

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

interface ChatSendAck {
  ok: boolean;
  error?: string;
}

/**
 * Attach Socket.io to the existing HTTP server.
 *
 * Architecture:
 *   - JWT-authenticated handshake (cookie first, falls back to `auth.token`)
 *   - Each connection joins its own `user:<id>` room. Services dispatch
 *     direct notifications / messages by emitting to that room — no need
 *     for client-side `join` negotiation.
 *   - `chat:send` is the only client → server event; all other updates
 *     flow server → client.
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
    const room = userRoom(user.sub);
    void socket.join(room);
    logger.info("socket connected", { userId: user.sub, id: socket.id });

    socket.on(
      SOCKET_EVENTS.CHAT_SEND,
      async (payload: SendChatMessagePayload, ack?: (res: ChatSendAck) => void) => {
        try {
          if (
            !payload ||
            typeof payload.toUserId !== "string" ||
            typeof payload.body !== "string"
          ) {
            ack?.({ ok: false, error: "Invalid payload" });
            return;
          }
          // Persistence + fan-out to both participants happens in the service.
          await chatService.send(user.sub, payload.toUserId, payload.body);
          ack?.({ ok: true });
        } catch (err) {
          const message = err instanceof AppError ? err.message : "Could not deliver message";
          ack?.({ ok: false, error: message });
        }
      },
    );

    socket.on(SOCKET_EVENTS.CHAT_READ, async (peerId: string) => {
      if (typeof peerId !== "string" || peerId.length === 0) return;
      try {
        await chatService.markRead(user.sub, peerId);
      } catch (err) {
        logger.warn("chat:read failed", {
          err: err instanceof Error ? err.message : String(err),
        });
      }
    });

    socket.on("disconnect", () => {
      logger.info("socket disconnected", { id: socket.id });
    });
  });

  setIo(io);
  return io;
};
