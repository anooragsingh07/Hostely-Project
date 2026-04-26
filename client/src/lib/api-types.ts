/**
 * Standard JSON envelope from `utils/apiResponse` on the server.
 * Keeps feature API modules aligned without copy-pasting this shape.
 */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}
