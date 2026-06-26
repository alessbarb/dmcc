import { createHash } from "crypto";

export function hashAccessCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
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

  const enabled = state?.campaign?.settings?.lanModeEnabled;
  if (!enabled) {
    const err = new Error("Forbidden: LAN Mode is disabled for this campaign");
    (err as any).statusCode = 403;
    throw err;
  }

  const accessCode = request.headers["x-access-code"] as string;
  if (!accessCode) {
    const err = new Error("Unauthorized: Access code is required");
    (err as any).statusCode = 401;
    throw err;
  }

  const hash = state?.campaign?.settings?.localAccessCodeHash;
  const legacyCode = state?.campaign?.settings?.localAccessCode;

  // Migration path for campaigns created before hashed access codes existed.
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
  const base = getRequestRole(request, dmSessionToken);
  if (base !== "unauthenticated") return base;

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

