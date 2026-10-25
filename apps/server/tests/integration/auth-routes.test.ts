import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../src/app.js";
import { pool, closeDb } from "../../src/db/index.js";
import { runMigrations } from "../../src/db/migrator.js";

describe("Authentication API Routes", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    await runMigrations(pool);
    app = await buildApp();
  });

  beforeEach(async () => {
    await pool.query("DELETE FROM user_sessions;");
    await pool.query("DELETE FROM users;");
  });

  afterAll(async () => {
    await pool.query("DELETE FROM user_sessions;");
    await pool.query("DELETE FROM users;");
    await app.close();
    await closeDb();
  });

  describe("POST /api/auth/register", () => {
    it("fails when username is shorter than 4 characters", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          username: "abc",
          email: "user@example.com",
          password: "Password123!",
        },
      });

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body).message).toContain("Username must be at least 4 characters");
    });

    it("fails when email is invalid", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          username: "validuser",
          email: "not-an-email",
          password: "Password123!",
        },
      });

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body).message).toContain("valid email");
    });

    it("fails when password is missing a special character, number, or letter", async () => {
      // Missing special character
      const res1 = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          username: "validuser",
          email: "user1@example.com",
          password: "Password123",
        },
      });
      expect(res1.statusCode).toBe(400);
      expect(JSON.parse(res1.body).message).toContain("special character");

      // Missing number
      const res2 = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          username: "validuser",
          email: "user2@example.com",
          password: "Password!",
        },
      });
      expect(res2.statusCode).toBe(400);
      expect(JSON.parse(res2.body).message).toContain("number");

      // Shorter than 8 chars
      const res3 = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          username: "validuser",
          email: "user3@example.com",
          password: "P@ss1",
        },
      });
      expect(res3.statusCode).toBe(400);
      expect(JSON.parse(res3.body).message).toContain("at least 8 characters");
    });

    it("registers user successfully with 201 Created and session token", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          username: "johndoe",
          email: "john@example.com",
          password: "SecurePassword123!",
        },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      expect(body.user).toBeDefined();
      expect(body.user.username).toBe("johndoe");
      expect(body.user.email).toBe("john@example.com");
      expect(body.sessionToken).toBeDefined();
      expect(body.sessionToken.length).toBe(64);
    });

    it("rejects duplicate username with 409 Conflict", async () => {
      await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          username: "johndoe",
          email: "john1@example.com",
          password: "SecurePassword123!",
        },
      });

      const res = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          username: "JohnDoe", // case-insensitive check
          email: "john2@example.com",
          password: "SecurePassword123!",
        },
      });

      expect(res.statusCode).toBe(409);
      expect(JSON.parse(res.body).code).toBe("USERNAME_TAKEN");
    });

    it("rejects duplicate email with 409 Conflict", async () => {
      await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          username: "userone",
          email: "same@example.com",
          password: "SecurePassword123!",
        },
      });

      const res = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          username: "usertwo",
          email: "SAME@EXAMPLE.COM", // case-insensitive check
          password: "SecurePassword123!",
        },
      });

      expect(res.statusCode).toBe(409);
      expect(JSON.parse(res.body).code).toBe("EMAIL_TAKEN");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          username: "testuser",
          email: "test@example.com",
          password: "MyPassword456#",
        },
      });
    });

    it("logs in successfully via username", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          identifier: "testuser",
          password: "MyPassword456#",
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.user.username).toBe("testuser");
      expect(body.sessionToken).toBeDefined();
    });

    it("logs in successfully via email", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          identifier: "test@example.com",
          password: "MyPassword456#",
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.user.email).toBe("test@example.com");
      expect(body.sessionToken).toBeDefined();
    });

    it("rejects incorrect password with 401 Unauthorized", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          identifier: "testuser",
          password: "WrongPassword456#",
        },
      });

      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.body).code).toBe("INVALID_CREDENTIALS");
    });

    it("rejects unknown user identifier with 401 Unauthorized", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          identifier: "nonexistent",
          password: "MyPassword456#",
        },
      });

      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.body).code).toBe("INVALID_CREDENTIALS");
    });
  });

  describe("Session validation & logout", () => {
    it("returns user profile on /api/auth/me with valid Bearer token", async () => {
      const reg = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          username: "sessionuser",
          email: "session@example.com",
          password: "SessionPass123$",
        },
      });
      const { sessionToken, user } = JSON.parse(reg.body);

      const meRes = await app.inject({
        method: "GET",
        url: "/api/auth/me",
        headers: {
          authorization: `Bearer ${sessionToken}`,
        },
      });

      expect(meRes.statusCode).toBe(200);
      const meBody = JSON.parse(meRes.body);
      expect(meBody.user.id).toBe(user.id);
      expect(meBody.user.username).toBe("sessionuser");

      // Logout
      const logoutRes = await app.inject({
        method: "POST",
        url: "/api/auth/logout",
        headers: {
          authorization: `Bearer ${sessionToken}`,
        },
      });
      expect(logoutRes.statusCode).toBe(200);
      expect(JSON.parse(logoutRes.body).success).toBe(true);

      // Subsequent /me should fail with 401
      const meAfterLogout = await app.inject({
        method: "GET",
        url: "/api/auth/me",
        headers: {
          authorization: `Bearer ${sessionToken}`,
        },
      });
      expect(meAfterLogout.statusCode).toBe(401);
    });
  });
});
