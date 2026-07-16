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
import { randomUUID } from "crypto";
import { registerWebRoutes } from "./web/registerWebRoutes.js";
import { resolveWebUser } from "./web/webSession.js";

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
    throw new Error("DMCC_PUBLIC_ORIGIN is required when NODE_ENV=production");
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

function resolveCorsAllowedOrigins(nodeEnv = process.env.NODE_ENV, publicOrigin = process.env.DMCC_PUBLIC_ORIGIN): string[] {
  const configuredPublicOrigin = publicOrigin?.trim();

  if (nodeEnv === "production") {
    return [requireConfiguredPublicOrigin(configuredPublicOrigin)];
  }

  return Array.from(new Set([
    ...(configuredPublicOrigin ? [requireConfiguredPublicOrigin(configuredPublicOrigin)] : []),
    ...LOCAL_CORS_ORIGINS,
  ]));
}

function resolveAllowedMutationOrigins(nodeEnv = process.env.NODE_ENV, publicOrigin = process.env.DMCC_PUBLIC_ORIGIN): Set<string> {
  if (nodeEnv === "production") {
    return new Set([requireConfiguredPublicOrigin(publicOrigin)]);
  }

  const configuredPublicOrigin = publicOrigin?.trim();
  return new Set([
    ...(configuredPublicOrigin ? [requireConfiguredPublicOrigin(configuredPublicOrigin)] : []),
    ...LOCAL_CORS_ORIGINS,
  ]);
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
function resolveTrustProxyConfig(rawValue = process.env.DMCC_TRUST_PROXY_HOPS): TrustProxyConfig | undefined {
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

function getRequiredSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.trim().length === 0) {
    throw new Error("SESSION_SECRET is required");
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

export function buildHelmetConfig(nodeEnv = process.env.NODE_ENV): Parameters<typeof helmet>[1] {
  const isProduction = nodeEnv === "production";
  const connectSrc = isProduction
    ? ["'self'"]
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

function hasWebAuthenticationSignal(request: FastifyRequest): boolean {
  return Boolean(
    request.webUser ||
    request.headers.authorization ||
    request.headers.cookie
  );
}

function shouldDisableApiResponseCache(request: FastifyRequest): boolean {
  return isApiRequest(request) && (isMutationRequest(request) || hasWebAuthenticationSignal(request));
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

export interface ServerConfig {
  dataDir?: string;
  /** Override the public assets directory (used in tests to inject fake asset trees). */
  assetsDir?: string;
}

export function createServer(config?: ServerConfig): FastifyInstance {
  const trustProxy = resolveTrustProxyConfig();
  const server = Fastify({ logger: { level: "warn" }, trustProxy, bodyLimit: GLOBAL_JSON_BODY_LIMIT_BYTES });
  server.decorateRequest("webUser", null);
  const dataDir = config?.dataDir ?? join(homedir(), "Documents", "DMCampaignCompanion");

  server.register(helmet, buildHelmetConfig());

  server.addHook("onSend", async (request, reply, payload) => {
    if (shouldDisableApiResponseCache(request)) {
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

  const allowedOrigins = resolveCorsAllowedOrigins();
  const allowedMutationOrigins = resolveAllowedMutationOrigins();
  const sessionSecret = getRequiredSessionSecret();
  server.register(cookie, { secret: sessionSecret });
  server.register(rateLimit, {
    max: 200,
    timeWindow: "1 minute",
    allowList: (request) => !isApiRequest(request),
  });
  server.register(cors, {
    delegator: (request, callback) => {
      const requestOrigin = request.headers.origin;
      const isAllowedOrigin = typeof requestOrigin === "string" && allowedOrigins.includes(requestOrigin);
      callback(null, { origin: isAllowedOrigin ? requestOrigin : false, credentials: isAllowedOrigin });
    },
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
          response.header("Cache-Control", "no-store, max-age=0, must-revalidate");
          return;
        }

        if (isBuildAsset) {
          response.header("Cache-Control", "public, max-age=31536000, immutable");
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
    const requestContextId =
      getSingleHeader(request.headers["idempotency-key"]) ??
      getSingleHeader(request.headers["x-request-id"]) ??
      randomUUID();

    requestContextStore.run({ commandId: requestContextId, counter: 0 }, done);
  });

  server.addHook("preValidation", async (request, reply) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      const origin = request.headers.origin;
      if (origin) {
        let originValue: string | undefined;
        try {
          originValue = new URL(origin).origin;
        } catch {
          originValue = undefined;
        }

        if (!originValue || !allowedMutationOrigins.has(originValue)) {
          reply.code(403);
          return reply.send({ error: "Cross-origin mutation rejected" });
        }
      }
    }

    const webUser = await resolveWebUser(request);
    if (webUser) {
      request.setDecorator("webUser", webUser);
    }
  });

  const routeOptions = { dataDir, assetsDir: config?.assetsDir ?? publicAssetsPath };

  registerWebRoutes(server, routeOptions);

  return server;
}
