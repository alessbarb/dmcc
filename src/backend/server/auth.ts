import { createHash, createHmac, randomBytes, randomInt, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { hasCampaignDmAccessSync } from "./campaignAclStore.js";

const scryptAsync = promisify(scrypt);

function allowsLegacyTestAuth(request: any): boolean {
  return request.server?.allowLegacyTestAuth ?? process.env.NODE_ENV === "test";
}

export async function hashSecret(secret: string): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(secret, salt, 64)) as Buffer;
  return { hash: derived.toString("hex"), salt };
}

export async function verifySecret(secret: string, salt: string, expectedHash: string): Promise<boolean> {
  try {
    const derived = (await scryptAsync(secret, salt, 64)) as Buffer;
    const expected = Buffer.from(expectedHash, "hex");
    if (derived.length !== expected.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

// Legacy names retained while older modules/tests are migrated.
export const hashPin = hashSecret;
export const verifyPin = verifySecret;

export interface DmSessionPayload {
  dmId: string;
  vaultId: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  issuedAt: string;
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf-8").toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf-8");
}

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createDmSessionToken(payload: Omit<DmSessionPayload, "issuedAt">, secret: string): string {
  const encoded = base64UrlEncode(JSON.stringify({ ...payload, issuedAt: new Date().toISOString() }));
  const signature = signPayload(encoded, secret);
  return `dmst_${encoded}.${signature}`;
}

export function verifyDmSessionToken(token: string | undefined, secret: string): DmSessionPayload | null {
  if (!token) return null;

  // Existing tests use server.dmSessionToken directly. Keep that bypass isolated to NODE_ENV=test.
  if (process.env.NODE_ENV === "test" && token === secret) {
    return { dmId: "usr_dm", vaultId: "default", issuedAt: new Date(0).toISOString() };
  }

  if (!token.startsWith("dmst_")) return null;
  const unsigned = token.slice("dmst_".length);
  const [encoded, signature] = unsigned.split(".");
  if (!encoded || !signature) return null;

  const expectedSignature = signPayload(encoded, secret);
  const provided = Buffer.from(signature, "base64url");
  const expected = Buffer.from(expectedSignature, "base64url");
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(encoded)) as Partial<DmSessionPayload>;
    if (!parsed.dmId || !parsed.vaultId || !parsed.issuedAt) return null;
    return parsed as DmSessionPayload;
  } catch {
    return null;
  }
}

export function hashAccessCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export function hashCampaignAccessCode(campaignId: string, code: string, pepper: string): string {
  return `hmac-sha256:${createHmac("sha256", pepper).update(`${campaignId}:${code}`).digest("hex")}`;
}

export function verifyCampaignAccessCode(
  campaignId: string,
  code: string,
  storedHash: string | undefined,
  pepper: string
): boolean {
  if (!storedHash) return false;
  const candidate = storedHash.startsWith("hmac-sha256:")
    ? hashCampaignAccessCode(campaignId, code, pepper)
    : hashAccessCode(code);
  const actual = Buffer.from(storedHash);
  const expected = Buffer.from(candidate);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function hashPlayerToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generatePlayerToken(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let token = "";
  for (let i = 0; i < 8; i += 1) {
    token += alphabet[randomInt(0, alphabet.length)];
  }
  return token;
}

export function getRequestDmSession(request: any, dmSessionSecret: string): DmSessionPayload | null {
  if (request.unifiedDmSession) return request.unifiedDmSession as DmSessionPayload;
  if (!allowsLegacyTestAuth(request)) return null;
  const dmTokenHeader = request.headers["x-dm-token"] as string | undefined;
  const session = verifyDmSessionToken(dmTokenHeader, dmSessionSecret);
  if (session) return session;

  if (process.env.NODE_ENV === "test" && request.headers["x-role"] === "dm") {
    return { dmId: "usr_dm", vaultId: getValidatedVaultId(request), issuedAt: new Date(0).toISOString() };
  }

  return null;
}

export function getRequestDmId(request: any, dmSessionSecret: string): string | null {
  return getRequestDmSession(request, dmSessionSecret)?.dmId ?? null;
}

export function getRequestRole(request: any, dmSessionSecret: string): "dm" | "player" | "observer" | "unauthenticated" {
  if (getRequestDmSession(request, dmSessionSecret)) return "dm";
  return "unauthenticated";
}

export function isLoopbackRequest(request: any): boolean {
  const ip = request.ip;
  return ip === "127.0.0.1" || ip === "::1" || ip === "localhost" || ip === "::ffff:127.0.0.1";
}

export function assertDM(request: any, dmSessionSecret: string): void {
  const role = getRequestRole(request, dmSessionSecret);
  if (role !== "dm") {
    const err = new Error("Forbidden: DM access required");
    (err as any).statusCode = 403;
    throw err;
  }
}

export function assertDmCampaignAccess(
  request: any,
  dmSessionSecret: string,
  dataDir: string,
  vaultId: string,
  campaignId: string
): string {
  const dmSession = getRequestDmSession(request, dmSessionSecret);
  if (!dmSession) {
    const err = new Error("Forbidden: DM access required");
    (err as any).statusCode = 403;
    throw err;
  }

  if (!hasCampaignDmAccessSync(dataDir, vaultId, campaignId, dmSession.dmId)) {
    const err = new Error("Forbidden: You do not have access to this campaign");
    (err as any).statusCode = 403;
    throw err;
  }

  return dmSession.dmId;
}

export function assertCampaignAccess(
  request: any,
  state: any,
  campaignId: string,
  dmSessionSecret: string,
  dataDir?: string,
  vaultId?: string
): string {
  const membership = request.unifiedCampaignMembership as
    | { campaignId: string; role: "dm" | "player" | "observer" }
    | undefined;
  if (membership?.campaignId === campaignId) return membership.role;

  const role = getRequestRole(request, dmSessionSecret);
  if (role === "dm") {
    if (dataDir && vaultId) {
      assertDmCampaignAccess(request, dmSessionSecret, dataDir, vaultId, campaignId);
    }
    return "dm";
  }

  if (!allowsLegacyTestAuth(request)) {
    const err = new Error("Unauthorized: Campaign membership is required");
    (err as any).statusCode = 401;
    throw err;
  }

  // x-role is never a credential. Non-DM campaign access must present the
  // campaign access code here, or a player token through getRequestRoleWithTokens.
  const accessCode = request.headers["x-access-code"] as string;
  if (!accessCode) {
    const err = new Error("Unauthorized: Campaign access code is required");
    (err as any).statusCode = 401;
    throw err;
  }

  const hash = state?.campaign?.settings?.localAccessCodeHash;
  const legacyCode = state?.campaign?.settings?.localAccessCode;

  if (legacyCode && accessCode === legacyCode) {
    return request.headers["x-role"] === "observer" ? "observer" : "player";
  }

  if (hash) {
    const calculatedHash = hashAccessCode(accessCode);
    if (calculatedHash === hash) {
      return request.headers["x-role"] === "observer" ? "observer" : "player";
    }
  }

  const err = new Error("Unauthorized: Invalid campaign access code");
  (err as any).statusCode = 401;
  throw err;
}

export function getRequestRoleWithTokens(
  request: any,
  dmSessionSecret: string,
  playerTokens: Map<string, { campaignId: string; playerId: string }>,
  campaignId: string,
  dataDir?: string,
  vaultId?: string
): "dm" | "player" | "observer" | "unauthenticated" {
  const membership = request.unifiedCampaignMembership as
    | { campaignId: string; role: "dm" | "player" | "observer" }
    | undefined;
  if (membership?.campaignId === campaignId) return membership.role;

  const dmSession = getRequestDmSession(request, dmSessionSecret);
  if (dmSession) {
    if (dataDir && vaultId && !hasCampaignDmAccessSync(dataDir, vaultId, campaignId, dmSession.dmId)) {
      return "unauthenticated";
    }
    return "dm";
  }

  if (!allowsLegacyTestAuth(request)) return "unauthenticated";

  // Player must present a valid player token — x-role header is not a credential
  const playerTokenHeader = request.headers["x-player-token"] as string | undefined;
  if (playerTokenHeader) {
    const session = playerTokens.get(playerTokenHeader);
    if (session && session.campaignId === campaignId) {
      return "player";
    }
  }
  return "unauthenticated";
}

export function getRequestPlayerId(request: any): string | undefined {
  const membership = request.unifiedCampaignMembership as { role?: string; playerId?: string } | undefined;
  if (membership?.role === "player") return membership.playerId;
  return allowsLegacyTestAuth(request)
    ? request.headers["x-player-id"] as string | undefined
    : undefined;
}

export function getRequestActorId(request: any, dmSessionSecret: string, fallback?: string): string {
  if (request.unifiedUser?.userId) return request.unifiedUser.userId;
  const dmSession = getRequestDmSession(request, dmSessionSecret);
  if (dmSession?.dmId) return dmSession.dmId;
  const membership = request.unifiedCampaignMembership as { playerId?: string } | undefined;
  if (membership?.playerId) return membership.playerId;
  return fallback ?? "usr_dm";
}

export function getValidatedVaultId(request: any): string {
  const vaultId = (request.headers["x-vault-id"] as string) || "default";
  if (!/^[a-zA-Z0-9_-]+$/.test(vaultId)) {
    const err = new Error("Invalid vault ID format");
    (err as any).statusCode = 400;
    throw err;
  }
  return vaultId;
}

export function getValidatedCampaignId(campaignId: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(campaignId)) {
    const err = new Error("Invalid campaign ID format");
    (err as any).statusCode = 400;
    throw err;
  }
  return campaignId;
}
