import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import Fastify, { type FastifyServerOptions } from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
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
import { isLoopbackIp } from "./sameOrigin.js";
import { registerWebPlatformRoutes } from "./web/webPlatformRoutes.js";


const PLACEHOLDER_SESSION_SECRETS = new Set(["change-me", "dev-change-me"]);
const GLOBAL_JSON_BODY_LIMIT_BYTES = 1 * 1024 * 1024;

const LOCAL_CORS_ORIGINS = [
  "http://localhost:4877",
  "http://127.0.0.1:4877",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
] as const;

function requireConfiguredPublicOrigin(rawOrigin = process.env.DMCC_PUBLIC_ORIGIN): string {
  const origin = rawOrigin?.trim();

  if (!origin) {
    throw new Error("DMCC_PUBLIC_ORIGIN is required when NODE_ENV=production and DMCC_STORAGE_MODE=postgres");
  }

  try {
    const parsed = new URL(origin);
    if (parsed.origin !== origin || parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) {
      throw new Error("invalid origin");
    }
  } catch {
    throw new Error("DMCC_PUBLIC_ORIGIN must be an absolute origin such as https://app.example.com");
  }

  return origin;
}

export function resolveCorsAllowedOrigins(nodeEnv = process.env.NODE_ENV, publicOrigin = process.env.DMCC_PUBLIC_ORIGIN): string[] {
  const configuredPublicOrigin = publicOrigin?.trim();

  if (nodeEnv === "production") {
    return [requireConfiguredPublicOrigin(configuredPublicOrigin)];
  }

  return Array.from(new Set([
    ...(configuredPublicOrigin ? [requireConfiguredPublicOrigin(configuredPublicOrigin)] : []),
    ...LOCAL_CORS_ORIGINS,
  ]));
}

type TrustProxyConfig = FastifyServerOptions["trustProxy"];

/**
 * Resolves Fastify trustProxy from an explicit deployment variable.
 *
 * DMCC only trusts forwarded IP headers when DMCC_TRUST_PROXY_HOPS is set to a
 * bounded hop count (for example, "1" on Render) or to specific proxy
 * addresses/CIDRs supported by Fastify. Empty, absent, and "0" keep local
 * development safe by disabling trustProxy. The open `true` mode is
 * intentionally not accepted because it trusts every upstream sender.
 */
export function resolveTrustProxyConfig(rawValue = process.env.DMCC_TRUST_PROXY_HOPS): TrustProxyConfig | undefined {
  const value = rawValue?.trim();
  if (!value || value === "0") {
    return undefined;
  }

  if (/^\d+$/.test(value)) {
    const hopCount = Number(value);
    if (!Number.isSafeInteger(hopCount) || hopCount < 0) {
      throw new Error("DMCC_TRUST_PROXY_HOPS must be 0, a positive integer hop count, or proxy CIDR/address entries");
    }
    return hopCount === 0 ? undefined : hopCount;
  }

  if (value.toLowerCase() === "true") {
    throw new Error("DMCC_TRUST_PROXY_HOPS=true is not allowed; use a hop count such as 1 or explicit proxy CIDRs/addresses");
  }

  const entries = value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  if (entries.length === 0 || entries.some((entry) => entry.toLowerCase() === "true" || entry === "0")) {
    throw new Error("DMCC_TRUST_PROXY_HOPS must be 0, a positive integer hop count, or proxy CIDR/address entries");
  }

  return entries.length === 1 ? entries[0] : entries;
}

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

type StorageMode = "legacy" | "postgres";

function buildHelmetConfig(storageMode: StorageMode): Parameters<typeof helmet>[1] {
  const isProduction = process.env.NODE_ENV === "production";
  const isPostgresWebMode = storageMode === "postgres";
  const connectSrc = isPostgresWebMode
    ? ["'self'", "ws:", "wss:", "http://localhost:*", "http://127.0.0.1:*"]
    : ["'self'", "ws:", "wss:", "http://localhost:*", "http://127.0.0.1:*"];

  return {
    enableCSPNonces: true,
    hsts: isProduction
      ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "https:"],
        // React and the canvas/graph libraries still emit trusted style attributes for layout and positioning.
        // Keep this exception scoped to style attributes only; script inline execution must use nonces.
        "style-src-attr": ["'unsafe-inline'"],
        "img-src": ["'self'", "data:", "blob:", "https:"],
        "connect-src": connectSrc,
        "font-src": ["'self'", "data:", "https:"],
        "object-src": ["'none'"],
        "upgrade-insecure-requests": [],
      },
    },
  };
}

function addCspNonceToInlineHtmlAssets(html: string, reply: FastifyReply): string {
  const nonce = reply.cspNonce.script;
  return html
    .replace(/<script(?![^>]*\bsrc=)(?![^>]*\bnonce=)([^>]*)>/gi, `<script nonce="${nonce}"$1>`)
    .replace(/<style(?![^>]*\bnonce=)([^>]*)>/gi, `<style nonce="${reply.cspNonce.style}"$1>`);
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

function isApiRequest(request: FastifyRequest): boolean {
  return getRequestPath(request.raw.url).startsWith("/api/");
}

function isMutationRequest(request: FastifyRequest): boolean {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);
}

type AuthenticatedRequest = FastifyRequest & {
  unifiedUser?: unknown;
  unifiedDmSession?: unknown;
  unifiedCampaignMembership?: unknown;
};

function hasAuthenticationSignal(request: FastifyRequest, dmSessionToken: string): boolean {
  const authenticatedRequest = request as AuthenticatedRequest;
  if (
    authenticatedRequest.unifiedUser ||
    authenticatedRequest.unifiedDmSession ||
    authenticatedRequest.unifiedCampaignMembership ||
    getRequestDmSession(request, dmSessionToken)
  ) {
    return true;
  }

  return Boolean(
    request.headers.authorization ||
    request.headers.cookie ||
    request.headers["x-dm-token"] ||
    request.headers["x-player-token"]
  );
}

function shouldDisableApiResponseCache(request: FastifyRequest, dmSessionToken: string): boolean {
  return isApiRequest(request) && (isMutationRequest(request) || hasAuthenticationSignal(request, dmSessionToken));
}

function isHtmlReply(reply: FastifyReply): boolean {
  const contentType = reply.getHeader("content-type");
  const value = Array.isArray(contentType) ? contentType.join(";") : String(contentType ?? "");
  return value.toLowerCase().includes("text/html");
}

function looksLikeHtml(payload: string | Buffer): boolean {
  const text = Buffer.isBuffer(payload) ? payload.subarray(0, 256).toString("utf8") : payload.slice(0, 256);
  return /^\s*<!doctype html|^\s*<html[\s>]/i.test(text);
}

function resolveStorageMode(configuredStorageMode?: StorageMode): StorageMode {
  if (configuredStorageMode) return configuredStorageMode;

  const envStorageMode = process.env.DMCC_STORAGE_MODE;
  if (envStorageMode === "postgres" || envStorageMode === "legacy") {
    return envStorageMode;
  }

  const actual = envStorageMode === undefined || envStorageMode.trim() === ""
    ? "absent"
    : `"${envStorageMode}"`;
  throw new Error(
    `DMCC_STORAGE_MODE must be explicitly set to "postgres" or "legacy" when config.storageMode is not provided; received ${actual}.`,
  );
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
  storageMode?: StorageMode;
}

export function createServer(config?: ServerConfig): FastifyInstance {
  const trustProxy = resolveTrustProxyConfig();
  const server = Fastify({ logger: { level: "warn" }, trustProxy, bodyLimit: GLOBAL_JSON_BODY_LIMIT_BYTES });
  const dataDir = config?.dataDir ?? join(homedir(), "Documents", "DMCampaignCompanion");
  const storageMode = resolveStorageMode(config?.storageMode);
  const isPostgresWebMode = storageMode === "postgres";

  server.register(helmet, buildHelmetConfig(storageMode));

  server.addHook("onSend", async (request, reply, payload) => {
    if (shouldDisableApiResponseCache(request, server.dmSessionToken)) {
      reply.header("Cache-Control", "no-store");
    }

    if (typeof payload === "string" && (isHtmlReply(reply) || looksLikeHtml(payload))) {
      return addCspNonceToInlineHtmlAssets(payload, reply);
    }

    if (Buffer.isBuffer(payload) && (isHtmlReply(reply) || looksLikeHtml(payload))) {
      return Buffer.from(addCspNonceToInlineHtmlAssets(payload.toString("utf8"), reply), "utf8");
    }

    return payload;
  });

  const dmSessionToken = randomBytes(32).toString("hex");
  // Signing secret for DM session tokens. In tests it is also accepted as a legacy DM token.
  server.decorate("dmSessionToken", dmSessionToken);

  // Whether the server is exposed on LAN (0.0.0.0) — set by entry/serverConfig.ts
  server.decorate("lanExposed", false);

  // In-memory active access codes mapping campaignId -> plaintext code
  server.decorate("activeAccessCodes", new Map<string, string>());

  // In-memory player session tokens: token → { campaignId, playerId }
  server.decorate("playerTokens", new Map<string, { campaignId: string; playerId: string }>());
  server.decorate("allowLegacyTestAuth", config?.allowLegacyTestAuth === true);


  if (isPostgresWebMode) {
    const allowedOrigins = resolveCorsAllowedOrigins();
    const sessionSecret = getRequiredSessionSecret();
    server.register(cookie, { secret: sessionSecret });
    server.register(rateLimit, { max: 200, timeWindow: "1 minute" });
    server.register(cors, {
      delegator: (request, callback) => {
        const requestOrigin = request.headers.origin;
        const isAllowedOrigin = typeof requestOrigin === "string" && allowedOrigins.includes(requestOrigin);
        callback(null, { origin: isAllowedOrigin ? requestOrigin : false, credentials: isAllowedOrigin });
      },
    });
  } else {
    server.register(cors, { origin: [...LOCAL_CORS_ORIGINS] });
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
  const publicAssetsPath = process.env.NODE_ENV === "test" && !explicitPublicPath
    ? undefined
    : publicPathCandidates.find((candidate) => existsSync(join(candidate, "assets")));
  const hasBuiltSpa = Boolean(publicPath);

  async function sendSpaIndex(reply: FastifyReply): Promise<string> {
    const html = await readFile(join(publicPath ?? "", "index.html"), "utf8");
    reply.type("text/html; charset=utf-8");
    return html;
  }

  if (publicPath) {
    server.get("/", async (_request, reply) => sendSpaIndex(reply));

    server.register(fastifyStatic, {
      root: publicPath,
      prefix: "/",
      wildcard: false,
      index: false,
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
        return await sendSpaIndex(reply);
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
        // request.ip is normalized by Fastify, including X-Forwarded-For only when
        // DMCC_TRUST_PROXY_HOPS explicitly enables trustProxy for the deployment.
        if (!isLoopbackIp(request.ip)) {
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
  const opts = { dataDir };
  server.register(registerAssetRoutes, { assetsDir: config?.assetsDir ?? publicAssetsPath });
  registerWebPlatformRoutes(server);
  server.register(registerAccountRoutes, opts);
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
  server.register(registerAssetRoutes, { assetsDir: config?.assetsDir ?? publicAssetsPath });

  return server;
}
