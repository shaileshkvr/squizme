import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import {
  LoginRequestSchema,
  RegisterRequestSchema,
} from "@squizme/shared";
import { pool } from "../../db/index.js";
import {
  createSession,
  createUser,
  deleteSession,
  findUserByEmail,
  findUserByIdentifier,
  findUserByUsername,
} from "./auth.repository.js";
import { hashPassword, verifyPassword } from "./password.js";
import { extractSessionToken } from "../../plugins/auth.js";

export const authRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // 1. Register a new user
  app.post(
    "/auth/register",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Register a new user account",
      },
    },
    async (request, reply) => {
      const parseResult = RegisterRequestSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.badRequest(parseResult.error.errors[0]?.message || "Validation failed");
      }

      const { username, email, password } = parseResult.data;

      // Check unique username
      const existingUserByUsername = await findUserByUsername(pool, username);
      if (existingUserByUsername) {
        return reply.status(409).send({
          statusCode: 409,
          error: "Conflict",
          code: "USERNAME_TAKEN",
          message: "Username is already taken",
        });
      }

      // Check unique email
      const existingUserByEmail = await findUserByEmail(pool, email);
      if (existingUserByEmail) {
        return reply.status(409).send({
          statusCode: 409,
          error: "Conflict",
          code: "EMAIL_TAKEN",
          message: "Email is already registered",
        });
      }

      // Hash password and insert user
      const passwordHash = await hashPassword(password);
      const user = await createUser(pool, {
        username,
        email,
        passwordHash,
      });

      // Issue session token
      const session = await createSession(pool, user.id);

      return reply.status(201).send({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.created_at.toISOString(),
        },
        sessionToken: session.session_token,
      });
    }
  );

  // 2. Log in with username OR email
  app.post(
    "/auth/login",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Log in with username or email and password",
      },
    },
    async (request, reply) => {
      const parseResult = LoginRequestSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.badRequest(parseResult.error.errors[0]?.message || "Validation failed");
      }

      const { identifier, password } = parseResult.data;

      const user = await findUserByIdentifier(pool, identifier);
      if (!user) {
        return reply.status(401).send({
          statusCode: 401,
          error: "Unauthorized",
          code: "INVALID_CREDENTIALS",
          message: "Invalid username/email or password",
        });
      }

      const isValidPassword = await verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return reply.status(401).send({
          statusCode: 401,
          error: "Unauthorized",
          code: "INVALID_CREDENTIALS",
          message: "Invalid username/email or password",
        });
      }

      // Issue new session
      const session = await createSession(pool, user.id);

      return reply.send({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.created_at.toISOString(),
        },
        sessionToken: session.session_token,
      });
    }
  );

  // 3. Log out (invalidate active session)
  app.post(
    "/auth/logout",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Log out and invalidate current session",
      },
    },
    async (request, reply) => {
      const token = extractSessionToken(request);
      if (token) {
        await deleteSession(pool, token);
      }
      return reply.send({ success: true });
    }
  );

  // 4. Get current user profile
  app.get(
    "/auth/me",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Get current authenticated user profile",
      },
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({
          statusCode: 401,
          error: "Unauthorized",
          code: "UNAUTHENTICATED",
          message: "You must be logged in to access this resource",
        });
      }

      return reply.send({
        user: request.user,
      });
    }
  );
};
