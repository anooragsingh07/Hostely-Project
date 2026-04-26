/**
 * Smoke tests — no MongoDB required. Validates routing, validation, and
 * security middleware without persisting data. Run `npm run test` from repo root.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import type { Express } from "express";

let app: Express;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.PORT = "4000";
  process.env.MONGODB_URI = "mongodb://127.0.0.1:65534/hostely-smoke-unreachable";
  process.env.JWT_SECRET = "01234567890123456789012345678901";
  process.env.COLLEGE_EMAIL_DOMAINS = "test.edu";
  process.env.CLIENT_ORIGIN = "http://localhost:3000";

  const { createApp } = await import("../app.js");
  app = createApp();
});

afterAll(() => {
  delete process.env.NODE_ENV;
});

describe("HTTP surface", () => {
  it("GET /api/v1/health returns ok", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.status).toBe("ok");
  });

  it("POST /api/v1/auth/register rejects invalid payload before DB", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({});
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/v1/auth/login rejects invalid payload", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({ email: "not-an-email" });
    expect(res.status).toBe(422);
  });

  it("GET /api/v1/items without cookie returns 401", async () => {
    const res = await request(app).get("/api/v1/items");
    expect(res.status).toBe(401);
  });

  it("GET /api/v1/chat/conversations without cookie returns 401", async () => {
    const res = await request(app).get("/api/v1/chat/conversations");
    expect(res.status).toBe(401);
  });
});
