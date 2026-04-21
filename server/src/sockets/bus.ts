import type { Server as IoServer } from "socket.io";
import { type SOCKET_EVENTS, userRoom } from "@hostely/shared";
import { logger } from "../utils/logger.js";

/**
 * Realtime bus — a thin global handle to the Socket.io server so
 * services can emit without importing `io` directly (which would
 * create a circular dependency between transport and business layers).
 *
 * `setIo` is called once during boot from `initSocket`.
 */
let ioRef: IoServer | null = null;

export const setIo = (io: IoServer): void => {
  ioRef = io;
};

/** Emit an event to a specific user's room. No-op if socket isn't initialized. */
export const emitToUser = (
  userId: string,
  event: (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS],
  payload: unknown,
): void => {
  if (!ioRef) {
    logger.warn("emitToUser before socket init", { userId, event });
    return;
  }
  ioRef.to(userRoom(userId)).emit(event, payload);
};

/** Access the underlying server — e.g. when registering handlers on connect. */
export const getIo = (): IoServer | null => ioRef;
