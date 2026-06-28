import type { FastifyInstance } from "fastify";
import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { existsSync } from "fs";
import { join, dirname, resolve } from "path";
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
import { registerTagRoutes } from "./routes/tagRoutes.js";
import { registerRuleRoutes } from "./routes/ruleRoutes.js";
import { registerCanvasRoutes } from "./routes/canvasRoutes.js";
import { registerPlayerPortalRoutes } from "./routes/playerPortalRoutes.js";
import { registerHardeningRoutes } from "./routes/hardeningRoutes.js";
import { registerAuthRoutes } from "./routes/authRoutes.js";

export interface ServerConfig {
  dataDir?: string;
}

export function createServer(config?: ServerConfig): FastifyInstance {
  const server = Fastify({ logger: false });
  const dataDir = config?.dataDir ?? join(homedir(), "Documents", "DMCampaignCompanion");

  const dmSessionToken = randomBytes(32).toString("hex");
  server.decorate("dmSessionToken", dmSessionToken);

  // Whether the server is exposed on LAN (0.0.0.0) — set by entry/serverConfig.ts
  server.decorate("lanExposed", false);

  // In-memory active access codes mapping campaignId -> plaintext code
  server.decorate("activeAccessCodes", new Map<string, string>());

  // In-memory player session tokens: token → { campaignId, playerId }
  server.decorate("playerTokens", new Map<string, { campaignId: string; playerId: string }>());


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
  const explicitPublicPath = process.env.DMCC_PUBLIC_DIR;
  const publicPathCandidates = [
    explicitPublicPath ? resolve(explicitPublicPath) : null,
    resolve(process.cwd(), "dist/public"),
    resolve(__dirname, "../../../public"),
    resolve(__dirname, "../../public"),
    resolve(__dirname, "../public"),
  ].filter((candidate): candidate is string => Boolean(candidate));
  const publicPath = process.env.NODE_ENV === "test" && !explicitPublicPath
    ? undefined
    : publicPathCandidates.find((candidate) => existsSync(join(candidate, "index.html")));
  const hasBuiltSpa = Boolean(publicPath);

  if (publicPath) {
    server.register(fastifyStatic, { root: publicPath, prefix: "/", wildcard: false });
  }

  server.setNotFoundHandler(async (request, reply) => {
    if (request.raw.url?.startsWith("/api")) {
      reply.code(404);
      return { error: "API route not found" };
    }
    if (!hasBuiltSpa && request.raw.url?.startsWith("/join/")) {
      const hostHeader = request.headers.host ?? "127.0.0.1:4877";
      let hostname = "127.0.0.1";
      try {
        hostname = new URL(`http://${hostHeader}`).hostname;
      } catch {
        hostname = "127.0.0.1";
      }
      const devUiPort = Number(process.env.DMCC_DEV_UI_PORT ?? "5173");
      return reply.redirect(`http://${hostname}:${devUiPort}${request.raw.url}`);
    }
    if (hasBuiltSpa) {
      try {
        return reply.sendFile("index.html");
      } catch {
        reply.code(404);
        return { error: "Not found" };
      }
    }
    reply.code(404);
    return { error: "Not found" };
  });

  server.get("/api/auth/local-token", async (request, reply) => {
    if (!isLoopbackRequest(request)) {
      reply.code(403);
      return { error: "Forbidden: Local token is only available on loopback interface" };
    }
    const token = (server as any).dmSessionToken as string;
    // Return both keys: legacy `token` for compat + new `dmSessionToken`
    return { token, dmSessionToken: token };
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
  server.register(registerTagRoutes, opts);
  server.register(registerRuleRoutes, opts);
  server.register(registerCanvasRoutes, opts);
  server.register(registerPlayerPortalRoutes, opts);
  server.register(registerHardeningRoutes, opts);
  server.register(registerAuthRoutes, opts);

  return server;
}
