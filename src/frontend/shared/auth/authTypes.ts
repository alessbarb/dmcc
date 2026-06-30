export interface PlayerProfileEntry {
  campaignId: string;
  campaignTitle: string;
  playerId: string;
  displayName: string;
  email?: string;
  characterName?: string;
  lastAccessed: string;
  rememberToken?: boolean;
}

export interface DmProfileEntry {
  dmId: string;
  email: string;
  displayName?: string;
  lastAccessed: string;
}

export interface LocalIdentity {
  version: 1;
  serverOrigin: string;
  vaultId: string;
  dmProfiles: DmProfileEntry[];
  dm?: {
    pinSet?: boolean; // legacy local identity marker
    lastUnlockedAt?: string;
  };
  playerProfiles: PlayerProfileEntry[];
}

export interface SessionCreds {
  dmSessionToken?: string;
  activeRole?: "dm" | "player";
  activeDmId?: string;
  activeCampaignId?: string;
  playerTokens: Record<string, string>;  // campaignId → token
}

export interface AuthStatus {
  dmAccountConfigured: boolean;
  dmPinConfigured: boolean; // backwards-compatible alias for dmAccountConfigured
  legacyPinConfigured?: boolean;
  dmSessionValid: boolean;
  dm?: {
    dmId: string;
    email?: string;
    displayName?: string;
  } | null;
  dmProfiles: Array<{
    dmId: string;
    email: string;
    displayName?: string;
    lastLoginAt?: string;
  }>;
  localRequest: boolean;
  lanExposed: boolean;
}
