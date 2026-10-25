import type { FastifyInstance, FastifyRequest } from "fastify";
import { pool } from "../db/index.js";
import { findSessionByToken } from "../modules/auth/auth.repository.js";

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
}

declare module "fastify" {
  interface FastifyRequest {
    userId: string;
    user: AuthenticatedUser | null;
  }
}

export const DEV_DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

export function extractSessionToken(request: FastifyRequest): string | null {
  const authHeader = request.headers["authorization"];
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  const sessionHeader = request.headers["x-session-token"];
  if (typeof sessionHeader === "string" && sessionHeader.trim().length > 0) {
    return sessionHeader.trim();
  }
  return null;
}

export async function registerAuth(app: FastifyInstance): Promise<void> {
  app.decorateRequest("userId", DEV_DEFAULT_USER_ID);
  app.decorateRequest("user", null);

  app.addHook("onRequest", async (request: FastifyRequest) => {
    const token = extractSessionToken(request);
    if (token) {
      try {
        const sessionData = await findSessionByToken(pool, token);
        if (sessionData) {
          request.userId = sessionData.user.id;
          request.user = {
            id: sessionData.user.id,
            username: sessionData.user.username,
            email: sessionData.user.email,
          };
          return;
        }
      } catch {
        // Fall back on transient error
      }
    }

    const headerUserId = request.headers["x-user-id"];
    if (typeof headerUserId === "string" && headerUserId.trim().length > 0) {
      request.userId = headerUserId.trim();
      request.user = null;
    } else {
      request.userId = DEV_DEFAULT_USER_ID;
      request.user = null;
    }
  });
}
