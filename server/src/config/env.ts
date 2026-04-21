import "dotenv/config";
import { parseEmailDomains } from "@hostely/shared";
import { z } from "zod";

/**
 * Fail fast on boot if environment is misconfigured.
 * This is the ONLY place that reads process.env.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:3000"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 chars"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),

  SESSION_MAX_AGE_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 24 * 7),

  COLLEGE_EMAIL_DOMAINS: z
    .string()
    .min(1, "COLLEGE_EMAIL_DOMAINS is required (comma-separated list)"),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

/** Flattened, typed, frozen runtime config. */
export const env = Object.freeze({
  ...parsed.data,
  COLLEGE_EMAIL_DOMAINS_LIST: parseEmailDomains(parsed.data.COLLEGE_EMAIL_DOMAINS),
});
export type Env = typeof env;
