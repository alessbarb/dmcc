import type { FastifyInstance } from "fastify";
import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import { existsSync } from "fs";
import { basename, join, dirname, resolve, sep } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";
import { requestContextStore } from "../../core/persistence/context.js";
import { randomBytes, randomUUID } from "crypto";
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
import { registerAccountRoutes } from "./routes/accountRoutes.js";
import { registerPremadeCampaignRoutes } from "./routes/premadeCampaignRoutes.js";
import { registerAssetRoutes } from "./routes/assetRoutes.js";
import { getSessionUser, readUserAuthStore } from "./userAuthStore.js";
import { readSessionCookie } from "./sessionAuth.js";
import { resolveWebUser } from "./web/webSession.js";
import { registerWebPlatformRoutes } from "./web/webPlatformRoutes.js";


const PLACEHOLDER_SESSION_SECRETS = new Set(["change-me", "dev-change-me"]);

export function getRequiredSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.trim().length === 0) {
    throw new Error("SESSION_SECRET is required when DMCC_STORAGE_MODE=postgres");
  }

  if (secret !== secret.trim()) {
    throw new Error("SESSION_SECRET must not contain leading or trailing whitespace");
  }

  if (PLACEHOLDER_SESSION_SECRETS.has(secret)) {
    throw new Error("SESSION_SECRET must be a unique deployment secret, not a placeholder value");
  }

  if (secret.length < 32 || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters and 32 bytes long");
  }

  return secret;
}

export interface ServerConfig {
  dataDir?: string;
  /** Override the public assets directory (used in tests to inject fake asset trees). */
  assetsDir?: string;
  /** Keeps pre-migration credentials available only to the legacy test suite. */
  allowLegacyTestAuth?: boolean;
  /**
   * `postgres` enables the final web/app storage model: PostgreSQL, web accounts,
   * campaign memberships, invitations and no vault/LAN/token persistence.
   * Legacy remains available for existing tests until the frontend/backend are fully cut over.
   */
  storageMode?: "legacy" | "postgres";
}

export function createServer(config?: ServerConfig): FastifyInstance {
  const server = Fastify({ logger: { level: "warn" } });
  const dataDir = config?.dataDir ?? join(homedir(), "Documents", "DMCampaignCompanion");
  const storageMode = config?.storageMode ?? (process.env.DMCC_STORAGE_MODE === "postgres" ? "postgres" : "legacy");
  const isPostgresWebMode = storageMode === "postgres";

  const dmSessionToken = randomBytes(32).toString("hex");
  // Signing secret for DM session tokens. In tests it is also accepted as a legacy DM token.
  server.decorate("dmSessionToken", dmSessionToken);

  // Whether the server is exposed on LAN (0.0.0.0) — set by entry/serverConfig.ts
  server.decorate("lanExposed", false);

  // In-memory active access codes mapping campaignId -> plaintext code
  server.decorate("activeAccessCodes", new Map<string, string>());

  // In-memory player session tokens: token → { campaignId, playerId }
  server.decorate("playerTokens", new Map<string, { campaignId: string; playerId: string }>());
  server.decorate(
    "allowLegacyTestAuth",
    process.env.NODE_ENV === "test" && config?.allowLegacyTestAuth !== false
  );


  if (isPostgresWebMode) {
    const allowedOrigin = process.env.DMCC_PUBLIC_ORIGIN ?? "http://localhost:5173";
    const sessionSecret = getRequiredSessionSecret();
    server.register(cookie, { secret: sessionSecret });
    server.register(helmet, {
      contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"],
          "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          "style-src": ["'self'", "'unsafe-inline'", "https:"],
          "img-src": ["'self'", "data:", "blob:", "https:"],
          "connect-src": ["'self'", "ws:", "wss:", "http://localhost:*", "http://127.0.0.1:*"],
          "font-src": ["'self'", "data:", "https:"],
          "object-src": ["'none'"],
          "upgrade-insecure-requests": [],
        },
      },
    });
    server.register(rateLimit, { max: 200, timeWindow: "1 minute" });
    server.register(cors, { origin: [allowedOrigin, "http://127.0.0.1:5173", "http://localhost:4877"], credentials: true });
  } else {
    server.register(cors, {
      origin: [
        "http://localhost:4877",
        "http://127.0.0.1:4877",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ],
    });
  }

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

  function getSingleHeader(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) return value[0];
    return value;
  }

  server.addHook("onRequest", (request, _reply, done) => {
    const commandId =
      getSingleHeader(request.headers["idempotency-key"]) ??
      getSingleHeader(request.headers["command-id"]) ??
      randomUUID();

    request.headers["command-id"] = commandId;
    requestContextStore.run({ commandId, counter: 0 }, done);
  });

  server.addHook("preValidation", async (request, reply) => {
    const pathname = getRequestPath(request.raw.url);
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      const origin = request.headers.origin;
      if (origin) {
        const host = request.headers.host;
        let originHost: string | undefined;
        let originValue: string | undefined;
        try {
          const parsedOrigin = new URL(origin);
          originHost = parsedOrigin.host;
          originValue = parsedOrigin.origin;
        } catch {
          originHost = undefined;
          originValue = undefined;
        }

        if (isPostgresWebMode) {
          const publicOrigin = (process.env.DMCC_PUBLIC_ORIGIN ?? "http://localhost:5173").replace(/\/$/, "");
          const allowedMutationOrigins = new Set([
            publicOrigin,
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:4877",
            "http://127.0.0.1:4877",
          ]);
          if (!originValue || (!allowedMutationOrigins.has(originValue) && originHost !== host)) {
            reply.code(403);
            return reply.send({ error: "Cross-origin mutation rejected" });
          }
        } else if (!host || originHost !== host) {
          reply.code(403);
          return reply.send({ error: "Cross-origin mutation rejected" });
        }
      } else {
        // No Origin header: reject mutations from non-loopback IPs (scripted LAN requests).
        const ip = request.ip;
        const isLoopback = ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";
        if (!isLoopback) {
          reply.code(403);
          return reply.send({ error: "Cross-origin mutation rejected" });
        }
      }
    }

    if (isPostgresWebMode) {
      const webUser = await resolveWebUser(request);
      if (webUser) {
        (request as any).webUser = webUser;
        (request as any).unifiedUser = {
          userId: webUser.userId,
          emailNormalized: webUser.email,
          displayName: webUser.displayName,
          vaultRole: webUser.appRole === "admin" ? "admin" : "user",
        };
      }
      return;
    }

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
      const campaignMembership = campaignId
        ? store.memberships.find(
            (membership) =>
              membership.userId === resolved.user.userId &&
              membership.campaignId === campaignId &&
              !membership.revokedAt
          )
        : undefined;
      if (campaignMembership) {
        (request as any).unifiedCampaignMembership = campaignMembership;
      }
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
    if ((request as any).unifiedCampaignMembership?.role === "dm") return;

    const campaignId = getValidatedCampaignId(decodeURIComponent(match[1]));
    if (!hasCampaignDmAccessSync(dataDir, vaultId, campaignId, dmSession.dmId)) {
      reply.code(403);
      return reply.send({ error: "Forbidden: You do not have access to this campaign" });
    }
  });

  if (isPostgresWebMode) {
    registerWebPlatformRoutes(server);
    return server;
  }

  server.get("/api/auth/local-token", async (_request, reply) => {
    if (!server.allowLegacyTestAuth) {
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
  server.register(registerAccountRoutes, opts);
  server.register(registerAssetRoutes, { assetsDir: config?.assetsDir ?? publicPath });

  return server;
}
