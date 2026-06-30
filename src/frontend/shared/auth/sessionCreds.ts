import type { SessionCreds } from "./authTypes.js";

const KEYS = {
  dmSessionToken: "dmcc_dmSessionToken",
  activeRole: "dmcc_role",
  activeDmId: "dmcc_activeDmId",
  activeCampaignId: "dmcc_activeCampaignId",
  playerTokenPrefix: "dmcc_playerToken:",
  // legacy keys — kept for compat during migration
  legacyPlayerId: "dmcc_playerId",
  legacyAccessCode: "dmcc_accessCode",
  legacyPlayerToken: "dmcc_playerToken",
} as const;

export function readSessionCreds(): SessionCreds {
  const playerTokens: Record<string, string> = {};

  // Read all per-campaign player tokens
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(KEYS.playerTokenPrefix)) {
      const campaignId = key.slice(KEYS.playerTokenPrefix.length);
      const token = sessionStorage.getItem(key);
      if (campaignId && token) playerTokens[campaignId] = token;
    }
  }

  // Legacy fallback: single dmcc_playerToken without campaignId
  const legacyToken = sessionStorage.getItem(KEYS.legacyPlayerToken);
  const legacyActiveCampaign = sessionStorage.getItem(KEYS.activeCampaignId);
  if (legacyToken && legacyActiveCampaign && !playerTokens[legacyActiveCampaign]) {
    playerTokens[legacyActiveCampaign] = legacyToken;
  }

  return {
    dmSessionToken: sessionStorage.getItem(KEYS.dmSessionToken) ?? undefined,
    activeRole: (sessionStorage.getItem(KEYS.activeRole) as "dm" | "player" | null) ?? undefined,
    activeDmId: sessionStorage.getItem(KEYS.activeDmId) ?? undefined,
    activeCampaignId: sessionStorage.getItem(KEYS.activeCampaignId) ?? undefined,
    playerTokens,
  };
}

export function setDmSessionToken(token: string, dmId?: string): void {
  sessionStorage.setItem(KEYS.dmSessionToken, token);
  sessionStorage.setItem(KEYS.activeRole, "dm");
  if (dmId) sessionStorage.setItem(KEYS.activeDmId, dmId);
}

export function clearDmSessionToken(): void {
  const activeRole = sessionStorage.getItem(KEYS.activeRole);
  sessionStorage.removeItem(KEYS.dmSessionToken);
  sessionStorage.removeItem(KEYS.activeDmId);
  if (activeRole === "dm") {
    sessionStorage.removeItem(KEYS.activeRole);
    sessionStorage.removeItem(KEYS.activeCampaignId);
  }
}

export function getDmSessionToken(): string | null {
  return sessionStorage.getItem(KEYS.dmSessionToken);
}

export function setPlayerSession(campaignId: string, playerId: string, playerToken: string): void {
  sessionStorage.setItem(`${KEYS.playerTokenPrefix}${campaignId}`, playerToken);
  sessionStorage.setItem(KEYS.activeRole, "player");
  sessionStorage.setItem(KEYS.activeCampaignId, campaignId);
  // Legacy keys for compat with campaignStore until migration complete
  sessionStorage.setItem(KEYS.legacyPlayerId, playerId);
  sessionStorage.setItem(KEYS.legacyPlayerToken, playerToken);
}

export function clearPlayerSession(campaignId: string): void {
  sessionStorage.removeItem(`${KEYS.playerTokenPrefix}${campaignId}`);
  // If this was the active campaign, clear active marker
  if (sessionStorage.getItem(KEYS.activeCampaignId) === campaignId) {
    sessionStorage.removeItem(KEYS.activeCampaignId);
    sessionStorage.removeItem(KEYS.activeRole);
    sessionStorage.removeItem(KEYS.legacyPlayerId);
    sessionStorage.removeItem(KEYS.legacyPlayerToken);
    sessionStorage.removeItem(KEYS.legacyAccessCode);
  }
}

export function getPlayerToken(campaignId: string): string | null {
  return sessionStorage.getItem(`${KEYS.playerTokenPrefix}${campaignId}`)
    ?? sessionStorage.getItem(KEYS.legacyPlayerToken); // legacy fallback
}

export function setActiveCampaign(campaignId: string): void {
  sessionStorage.setItem(KEYS.activeCampaignId, campaignId);
}

export function clearAllSessions(): void {
  // Clear all dmcc_ keys from sessionStorage
  const toRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.startsWith("dmcc_")) toRemove.push(key);
  }
  toRemove.forEach((k) => sessionStorage.removeItem(k));
}
