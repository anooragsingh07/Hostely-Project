/**
 * Domain error carrying HTTP semantics. Thrown from services,
 * normalized by the global error middleware.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR", details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(msg = "Bad request", details?: unknown): AppError {
    return new AppError(msg, 400, "BAD_REQUEST", details);
  }
  static unauthorized(msg = "Unauthorized"): AppError {
    return new AppError(msg, 401, "UNAUTHORIZED");
  }
  static forbidden(msg = "Forbidden"): AppError {
    return new AppError(msg, 403, "FORBIDDEN");
  }
  static notFound(msg = "Not found"): AppError {
    return new AppError(msg, 404, "NOT_FOUND");
  }
  static conflict(msg = "Conflict"): AppError {
    return new AppError(msg, 409, "CONFLICT");
  }
}
