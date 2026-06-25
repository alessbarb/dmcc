import type { FastifyInstance } from "fastify";
import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";
import { randomBytes } from "crypto";
import { isLoopbackRequest } from "./auth.js";
import { registerVaultRoutes } from "./routes/vaultRoutes.js";
import { registerCampaignRoutes } from "./routes/campaignRoutes.js";
import { registerPlayerRoutes } from "./routes/playerRoutes.js";
import { registerEntityRoutes } from "./routes/entityRoutes.js";
import { registerRelationRoutes } from "./routes/relationRoutes.js";
import { registerFactRoutes } from "./routes/factRoutes.js";
import { registerSessionRoutes } from "./routes/sessionRoutes.js";
import { registerExportRoutes } from "./routes/exportRoutes.js";
import { registerProjectionRoutes } from "./routes/projectionRoutes.js";

export interface ServerConfig {
  dataDir?: string;
}

export function createServer(config?: ServerConfig): FastifyInstance {
  const server = Fastify({ logger: false });
  const dataDir = config?.dataDir ?? join(homedir(), "Documents", "DMCampaignCompanion");

  const dmSessionToken = randomBytes(32).toString("hex");
  server.decorate("dmSessionToken", dmSessionToken);

  // In-memory active access codes mapping campaignId -> plaintext code
  server.decorate("activeAccessCodes", new Map<string, string>());


  server.register(cors, {
    origin: [
      "http://localhost:4877",
      "http://127.0.0.1:4877",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
  });

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const publicPath = join(__dirname, "..", "public");

  server.register(fastifyStatic, { root: publicPath, prefix: "/", wildcard: false });

  server.setNotFoundHandler(async (request, reply) => {
    if (request.raw.url?.startsWith("/api")) {
      reply.code(404);
      return { error: "API route not found" };
    }
    try {
      return reply.sendFile("index.html");
    } catch {
      reply.code(404);
      return { error: "Not found" };
    }
  });

  server.get("/api/auth/local-token", async (request, reply) => {
    if (!isLoopbackRequest(request)) {
      reply.code(403);
      return { error: "Forbidden: Local token is only available on loopback interface" };
    }
    return { token: (server as any).dmSessionToken };
  });

  const opts = { dataDir };
  server.register(registerVaultRoutes, opts);
  server.register(registerCampaignRoutes, opts);
  server.register(registerPlayerRoutes, opts);
  server.register(registerEntityRoutes, opts);
  server.register(registerRelationRoutes, opts);
  server.register(registerFactRoutes, opts);
  server.register(registerSessionRoutes, opts);
  server.register(registerExportRoutes, opts);
  server.register(registerProjectionRoutes, opts);

  return server;
}
