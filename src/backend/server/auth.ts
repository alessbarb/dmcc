import { createHash, randomBytes, randomInt, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function hashPin(pin: string): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(pin, salt, 64)) as Buffer;
  return { hash: derived.toString("hex"), salt };
}

export async function verifyPin(pin: string, salt: string, expectedHash: string): Promise<boolean> {
  try {
    const derived = (await scryptAsync(pin, salt, 64)) as Buffer;
    const expected = Buffer.from(expectedHash, "hex");
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

export function hashAccessCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
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

export function getRequestRole(request: any, dmSessionToken: string): "dm" | "player" | "observer" | "unauthenticated" {
  const roleHeader = request.headers["x-role"];
  const dmTokenHeader = request.headers["x-dm-token"];

  if (process.env.NODE_ENV === "test") {
    if (dmTokenHeader && dmTokenHeader === dmSessionToken) return "dm";
    if (roleHeader === "player") return "player";
    if (roleHeader === "observer") return "observer";
    if (roleHeader === "dm") return "dm";
    return "unauthenticated";
  }

  if (dmTokenHeader === dmSessionToken) {
    return "dm";
  }

  if (roleHeader === "player") {
    return "player";
  }

  if (roleHeader === "observer") {
    return "observer";
  }

  return "unauthenticated";
}

export function isLoopbackRequest(request: any): boolean {
  const ip = request.ip;
  return ip === "127.0.0.1" || ip === "::1" || ip === "localhost" || ip === "::ffff:127.0.0.1";
}

export function assertDM(request: any, dmSessionToken: string): void {
  const role = getRequestRole(request, dmSessionToken);
  if (role !== "dm") {
    const err = new Error("Forbidden: DM access required");
    (err as any).statusCode = 403;
    throw err;
  }
}

export function assertCampaignAccess(request: any, state: any, campaignId: string, dmSessionToken: string): string {
  const role = getRequestRole(request, dmSessionToken);
  if (role === "dm") {
    return "dm";
  }

  if (role !== "player" && role !== "observer") {
    const err = new Error("Unauthorized: Player or observer role is required");
    (err as any).statusCode = 401;
    throw err;
  }

  // LAN is always active — access code path retained as legacy fallback only.
  // Player-token auth (x-player-token) bypasses this via getRequestRoleWithTokens.
  const accessCode = request.headers["x-access-code"] as string;
  if (!accessCode) {
    return role;
  }

  const hash = state?.campaign?.settings?.localAccessCodeHash;
  const legacyCode = state?.campaign?.settings?.localAccessCode;

  if (legacyCode && accessCode === legacyCode) {
    return role;
  }

  if (hash) {
    const calculatedHash = hashAccessCode(accessCode);
    if (calculatedHash === hash) {
      return role;
    }
  }

  const err = new Error("Unauthorized: Invalid campaign access code");
  (err as any).statusCode = 401;
  throw err;
}

export function getRequestRoleWithTokens(
  request: any,
  dmSessionToken: string,
  playerTokens: Map<string, { campaignId: string; playerId: string }>,
  campaignId: string
): "dm" | "player" | "observer" | "unauthenticated" {
  // DM token is checked first
  const dmTokenHeader = request.headers["x-dm-token"];
  if (dmTokenHeader && dmTokenHeader === dmSessionToken) {
    return "dm";
  }

  // Test mode bypass for DM role only
  if (process.env.NODE_ENV === "test") {
    const roleHeader = request.headers["x-role"];
    if (roleHeader === "dm") return "dm";
  }

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

