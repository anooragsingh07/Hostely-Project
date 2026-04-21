import { io, type Socket } from "socket.io-client";
import { clientEnv } from "./env";

/**
 * Singleton Socket.io client. The server reads the session cookie from
 * the handshake, so `withCredentials: true` is all we need for auth —
 * there's no token to juggle in JavaScript.
 *
 * Lazy: we only connect on first `getSocket()` call so SSR / unauthenticated
 * visits don't spam the server with failed handshakes.
 */
let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (socket) return socket;
  socket = io(clientEnv.socketUrl, {
    withCredentials: true,
    autoConnect: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });
  return socket;
};

/** Disconnect + forget the instance — call on sign out. */
export const resetSocket = (): void => {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
};
