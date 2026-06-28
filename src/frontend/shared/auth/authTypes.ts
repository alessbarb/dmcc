export interface PlayerProfileEntry {
  campaignId: string;
  campaignTitle: string;
  playerId: string;
  displayName: string;
  characterName?: string;
  lastAccessed: string;
  rememberToken?: boolean;
}

export interface LocalIdentity {
  version: 1;
  serverOrigin: string;
  vaultId: string;
  dm?: {
    pinSet: boolean;
    lastUnlockedAt?: string;
  };
  playerProfiles: PlayerProfileEntry[];
}

export interface SessionCreds {
  dmSessionToken?: string;
  activeRole?: "dm" | "player";
  activeCampaignId?: string;
  playerTokens: Record<string, string>;  // campaignId → token
}

export interface AuthStatus {
  dmPinConfigured: boolean;
  dmSessionValid: boolean;
  localRequest: boolean;
  lanExposed: boolean;
}
