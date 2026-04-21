/**
 * Minimal structured logger. Keep deps small; swap for pino in prod if needed.
 */
type Level = "debug" | "info" | "warn" | "error";

const fmt = (level: Level, msg: string, meta?: unknown): string => {
  const base = { ts: new Date().toISOString(), level, msg };
  return JSON.stringify(meta ? { ...base, meta } : base);
};

export const logger = {
  debug: (msg: string, meta?: unknown) => process.stdout.write(fmt("debug", msg, meta) + "\n"),
  info: (msg: string, meta?: unknown) => process.stdout.write(fmt("info", msg, meta) + "\n"),
  warn: (msg: string, meta?: unknown) => process.stderr.write(fmt("warn", msg, meta) + "\n"),
  error: (msg: string, meta?: unknown) => process.stderr.write(fmt("error", msg, meta) + "\n"),
};
