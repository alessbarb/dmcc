import type { FastifyInstance } from "fastify";
import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { existsSync } from "fs";
import { basename, join, dirname, resolve, sep } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";
import { randomBytes } from "crypto";
import { getRequestDmSession, getValidatedCampaignId, getValidatedVaultId } from "./auth.js";
import { hasCampaignDmAccessSync } from "./campaignAclStore.js";
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
import { registerUserAuthRoutes } from "./routes/userAuthRoutes.js";
import { registerPremadeCampaignRoutes } from "./routes/premadeCampaignRoutes.js";
import { getSessionUser, readUserAuthStore } from "./userAuthStore.js";
import { readSessionCookie } from "./sessionAuth.js";

export interface ServerConfig {
  dataDir?: string;
}

export function createServer(config?: ServerConfig): FastifyInstance {
  const server = Fastify({ logger: false });
  const dataDir = config?.dataDir ?? join(homedir(), "Documents", "DMCampaignCompanion");

  const dmSessionToken = randomBytes(32).toString("hex");
  // Signing secret for DM session tokens. In tests it is also accepted as a legacy DM token.
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
    server.register(fastifyStatic, {
      root: publicPath,
      prefix: "/",
      wildcard: false,
      setHeaders(response, pathName) {
        const fileName = basename(pathName);
        const isBuildAsset = pathName.includes(`${sep}assets${sep}`);
        const isServiceWorkerAsset =
          fileName === "sw.js" ||
          fileName === "manifest.webmanifest" ||
          fileName.startsWith("workbox-");

        if (fileName === "index.html" || isServiceWorkerAsset) {
          response.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
          return;
        }

        if (isBuildAsset) {
          response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    });
  }

  function getRequestPath(rawUrl?: string): string {
    if (!rawUrl) {
      return "/";
    }

    try {
      return new URL(rawUrl, "http://dmcc.local").pathname;
    } catch {
      return rawUrl.split("?")[0] ?? "/";
    }
  }

  function shouldServeSpaFallback(rawUrl?: string): boolean {
    const pathname = getRequestPath(rawUrl);

    if (pathname.startsWith("/api")) {
      return false;
    }

    if (
      pathname.startsWith("/assets/") ||
      pathname.startsWith("/icons/") ||
      pathname === "/favicon.ico" ||
      pathname === "/sw.js" ||
      pathname === "/manifest.webmanifest" ||
      pathname.startsWith("/workbox-")
    ) {
      return false;
    }

    const lastSegment = pathname.split("/").pop() ?? "";

    // Any unknown file-like URL must be a real 404.
    // This prevents missing JS/CSS assets from receiving index.html as text/html.
    if (lastSegment.includes(".")) {
      return false;
    }

    return true;
  }

  server.setNotFoundHandler(async (request, reply) => {
    const rawUrl = request.raw.url;
    const pathname = getRequestPath(rawUrl);

    if (pathname.startsWith("/api")) {
      reply.code(404);
      return { error: "API route not found" };
    }

    if (!hasBuiltSpa && pathname.startsWith("/join/")) {
      const hostHeader = request.headers.host ?? "127.0.0.1:4877";
      let hostname = "127.0.0.1";

      try {
        hostname = new URL(`http://${hostHeader}`).hostname;
      } catch {
        hostname = "127.0.0.1";
      }

      const devUiPort = Number(process.env.DMCC_DEV_UI_PORT ?? "5173");
      return reply.redirect(`http://${hostname}:${devUiPort}${rawUrl ?? pathname}`);
    }

    if (hasBuiltSpa && shouldServeSpaFallback(rawUrl)) {
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

  server.addHook("preValidation", async (request, reply) => {
    const pathname = getRequestPath(request.raw.url);
    const vaultId = getValidatedVaultId(request);
    const vaultDir = join(dataDir, "vaults", vaultId);
    const resolved = await getSessionUser(vaultDir, readSessionCookie(request));
    if (resolved) {
      (request as any).unifiedUser = resolved.user;
      const store = await readUserAuthStore(vaultDir);
      const campaignMatch = pathname.match(/^\/api\/campaigns\/([^/]+)/);
      const campaignId = campaignMatch
        ? getValidatedCampaignId(decodeURIComponent(campaignMatch[1]))
        : undefined;
      const hasDmMembership = store.memberships.some(
        (membership) =>
          membership.userId === resolved.user.userId &&
          membership.role === "dm" &&
          !membership.revokedAt &&
          (!campaignId || membership.campaignId === campaignId)
      );
      const canActAsDm = campaignId ? hasDmMembership : resolved.user.vaultRole === "admin" || hasDmMembership;
      if (canActAsDm) {
        (request as any).unifiedDmSession = {
          dmId: resolved.user.userId,
          vaultId,
          email: resolved.user.emailNormalized,
          displayName: resolved.user.displayName,
          issuedAt: resolved.session.createdAt,
        };
      }
    }

    const match = pathname.match(/^\/api\/campaigns\/([^/]+)/);
    if (!match) return;

    const dmSession = getRequestDmSession(request, server.dmSessionToken);
    if (!dmSession) return;

    const campaignId = getValidatedCampaignId(decodeURIComponent(match[1]));
    if (!hasCampaignDmAccessSync(dataDir, vaultId, campaignId, dmSession.dmId)) {
      reply.code(403);
      return reply.send({ error: "Forbidden: You do not have access to this campaign" });
    }
  });

  server.get("/api/auth/local-token", async (_request, reply) => {
    if (process.env.NODE_ENV !== "test") {
      reply.code(410);
      return { error: "Local DM token shortcut has been removed. Use DM email + key login." };
    }
    const token = server.dmSessionToken;
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
  server.register(registerPremadeCampaignRoutes, opts);
  server.register(registerAuthRoutes, opts);
  server.register(registerUserAuthRoutes, opts);

  return server;
}
