import type { FastifyInstance, FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    userId: string;
  }
}

export const DEV_DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function registerAuth(app: FastifyInstance): Promise<void> {
  app.decorateRequest("userId", DEV_DEFAULT_USER_ID);

  app.addHook("onRequest", async (request: FastifyRequest) => {
    const headerUserId = request.headers["x-user-id"];
    if (typeof headerUserId === "string" && headerUserId.trim().length > 0) {
      request.userId = headerUserId.trim();
    } else {
      request.userId = DEV_DEFAULT_USER_ID;
    }
  });
}
